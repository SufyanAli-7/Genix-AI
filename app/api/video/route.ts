import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { auth } from "@clerk/nextjs/server";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { saveVideo } from "@/lib/video-storage";

// Configure FAL AI with API key
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // ADD API LIMIT CHECK HERE - After validation, before API calls
    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired.", { status: 403 });
    }

    console.log("Generating video with FAL AI LTX Video model...");
    console.log("Prompt:", prompt);

    // Use FAL AI's LTX Video model for video generation
    const result = await fal.subscribe("fal-ai/ltx-video", {
      input: {
        prompt: prompt,
        negative_prompt:
          "low quality, worst quality, deformed, distorted, disfigured, motion smear, motion artifacts, fused fingers, bad anatomy, weird hand, ugly",
        num_inference_steps: 30,
        guidance_scale: 3,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Video generation in progress...");
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("FAL AI Response:", result);

    if (result && result.data && result.data.video) {
      const videoUrl = result.data.video.url;
      console.log("Video generated successfully!");
      console.log("Video URL:", videoUrl);      // INCREASE API LIMIT AFTER SUCCESSFUL GENERATION
      if (!isPro) {
        await increaseApiLimit();
      }

      // Save video to database
      try {
        await saveVideo({
          prompt,
          videoUrl
        });
        console.log("[DATABASE_VIDEO_SAVED]", videoUrl);
      } catch (dbError) {
        console.log("[DATABASE_VIDEO_SAVE_ERROR]", dbError);
        // Continue even if database save fails
      }

      return NextResponse.json([videoUrl]);
    } else {
      console.log("No video data received from FAL AI");
      return NextResponse.json([
        "https://via.placeholder.com/640x360/000000/FFFFFF?text=Video+Generation+Failed",
      ]);
    }
  } catch (error) {
    console.log("[VIDEO_ERROR] FAL AI Error:", error);

    if (error instanceof Error) {
      console.log("Error message:", error.message);
    }

    // Return placeholder for any errors
    return NextResponse.json([
      "https://via.placeholder.com/640x360/000000/FFFFFF?text=Video+Generation+Temporarily+Unavailable",
    ]);
  }
}

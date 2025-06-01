import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const BEATOVEN_API_URL = "https://public-api.beatoven.ai";
const BEATOVEN_API_KEY = process.env.BEATOVEN_API_KEY;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!BEATOVEN_API_KEY) {
      return new NextResponse("Beatoven API Key not configured", {
        status: 500,
      });
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

    console.log("[MUSIC_REQUEST]", {
      prompt: prompt,
      url: `${BEATOVEN_API_URL}/api/v1/tracks/compose`,
    });

    // Step 1: Start the composition task
    const composeResponse = await fetch(
      `${BEATOVEN_API_URL}/api/v1/tracks/compose`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BEATOVEN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: {
            text: prompt,
          },
          format: "mp3",
          looping: false,
        }),
      }
    );

    const composeData = await composeResponse.json();

    console.log("[COMPOSE_RESPONSE]", {
      status: composeResponse.status,
      data: composeData,
    });

    if (!composeResponse.ok) {
      return new NextResponse(
        `Beatoven API error: ${
          composeData.error || "Failed to start composition"
        }`,
        { status: 500 }
      );
    }

    const taskId = composeData.task_id;
    if (!taskId) {
      return new NextResponse("No task ID received from Beatoven API", {
        status: 500,
      });
    }

    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // Maximum 5 minutes (60 * 5 seconds)

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(
        `${BEATOVEN_API_URL}/api/v1/tasks/${taskId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${BEATOVEN_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const statusData = await statusResponse.json();

      console.log("[STATUS_RESPONSE]", {
        attempt: attempts + 1,
        status: statusData.status,
        data: statusData,
      });

      if (statusData.status === "composed") {
        const trackUrl = statusData.meta?.track_url;
        if (trackUrl) {
          // INCREASE API LIMIT AFTER SUCCESSFUL GENERATION
          if (!isPro) {
            await increaseApiLimit();
          }
          return NextResponse.json({ audio: trackUrl });
        } else {
          return new NextResponse("Track URL not found in response", {
            status: 500,
          });
        }
      } else if (statusData.status === "failed") {
        return new NextResponse("Music composition failed", { status: 500 });
      }

      attempts++;
    }

    return new NextResponse("Music composition timed out", { status: 408 });
  } catch (error) {
    console.log("[MUSIC_ERROR]", error);
    return new NextResponse(
      `Internal error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { status: 500 }
    );
  }
}

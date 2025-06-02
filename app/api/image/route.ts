import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const IMAGEROUTER_API_URL =
  "https://ir-api.myqa.cc/v1/openai/images/generations";
const IMAGEROUTER_API_KEY = process.env.IMAGEROUTER_API_KEY;
const MODEL = "black-forest-labs/FLUX-1-schnell:free";

// ✅ Fix 2: Define proper type for API responses
interface ImageApiResponse {
  data?: unknown[];
  error?: { message: string };
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "auto" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!IMAGEROUTER_API_KEY) {
      return new NextResponse("ImageRouter API Key not configured", {
        status: 500,
      });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

    // ADD THE API LIMIT CHECK HERE - After validation, before API calls
    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired.", { status: 403 });
    }

    // ✅ Fix 1: Remove unused 'size' variable and its assignment
    // Convert resolution options to dimensions if needed (for future use)
    // let size = resolution;
    // if (
    //   resolution === "auto" ||
    //   resolution === "low" ||
    //   resolution === "medium" ||
    //   resolution === "high"
    // ) {
    //   // Map quality-based settings to dimensions
    //   const sizeMap: Record<string, string> = {
    //     auto: "512x512",
    //     low: "256x256",
    //     medium: "512x512",
    //     high: "1024x1024",
    //   };
    //   size = sizeMap[resolution] || "512x512";
    // }

    // ImageRouter expects these specific parameters according to the docs
    const requestBody = {
      prompt: prompt,
      model: MODEL,
      quality: resolution,
      n: 1,
    };

    console.log("[IMAGE_REQUEST]", {
      url: IMAGEROUTER_API_URL,
      model: MODEL,
      body: requestBody,
    });

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${IMAGEROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    };

    // Handle the API limitation by making multiple parallel requests if needed
    const requestCount = parseInt(amount, 10);
    let allResults: unknown[] = []; // ✅ Fix 2: Changed from any[] to unknown[]

    // Make multiple API calls in parallel if amount > 1
    if (requestCount > 1) {
      try {
        const requests = Array.from({ length: requestCount }, () =>
          fetch(IMAGEROUTER_API_URL, options)
            .then((res) => res.json() as Promise<ImageApiResponse>)
            .catch((err) => {
              console.error("[BATCH_REQUEST_ERROR]", err);
              return null;
            })
        );

        const responses = await Promise.all(requests);

        // Process all responses
        responses.forEach((resp) => {
          if (resp && resp.data) {
            allResults = allResults.concat(resp.data);
          } else if (resp) {
            allResults.push(resp);
          }
        });

        // INCREASE API LIMIT AFTER SUCCESSFUL GENERATION
        if (!isPro) {
          await increaseApiLimit();
        }

        console.log("[BATCH_RETURNING]", allResults);
        return NextResponse.json(allResults);
      } catch (batchError) {
        console.error("[BATCH_ERROR]", batchError);
        return new NextResponse(
          `Error processing multiple image requests: ${
            batchError instanceof Error
              ? batchError.message
              : String(batchError)
          }`,
          { status: 500 }
        );
      }
    }

    // If only one image is requested, make a single request
    const response = await fetch(IMAGEROUTER_API_URL, options);
    const data = await response.json() as ImageApiResponse;

    console.log("[IMAGE_RESPONSE]", {
      status: response.status,
      data: data,
    });

    if (!response.ok) {
      if (response.status === 403) {
        return new NextResponse("API limit reached", { status: 403 });
      }
      return new NextResponse(
        `ImageRouter API error: ${data.error?.message || "Unknown error"}`,
        { status: 500 }
      );
    }

    // INCREASE API LIMIT AFTER SUCCESSFUL GENERATION
    if (!isPro) {
      await increaseApiLimit();
    }

    // Check if data has a nested data property, which is common in API responses
    if (data.data) {
      console.log("[RETURNING]", data.data);
      return NextResponse.json(data.data);
    } else {
      console.log("[RETURNING]", data);
      return NextResponse.json(data);
    }
  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    console.log("[IMAGE_ERROR_DETAILS]", JSON.stringify(error));
    return new NextResponse(
      `Internal error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { status: 500 }
    );
  }
}

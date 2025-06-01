import { NextResponse } from "next/server";
import OpenAI from "openai";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

// Configure OpenAI client with GitHub's endpoint and token
const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});

const MODEL = "openai/gpt-4.1-mini";

export async function POST(req: Request) {
  try {
    // Check if GITHUB_TOKEN is available first
    if (!process.env.GITHUB_TOKEN) {
      return new NextResponse("GitHub token not configured", { status: 500 });
    }

    // Get request body
    const body = await req.json();
    const { messages } = body;

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired.", { status: 403 });
    }

    // Call GitHub's model inference endpoint
    const response = await client.chat.completions.create({
      messages,
      temperature: 1.0,
      top_p: 1.0,
      model: MODEL,
    });

    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

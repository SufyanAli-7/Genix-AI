import { NextResponse } from "next/server";
import OpenAI from "openai";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { saveConversation } from "@/lib/conversation";

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
    const { messages, conversationId } = body;

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
    });    // Get the user message (last message before the assistant response)
    const userMessage = messages[messages.length - 1];
    const assistantResponse = response.choices[0].message;

    // Convert to our ChatMessage format
    const assistantMessage = {
      role: "assistant" as const,
      content: assistantResponse.content || "Sorry, I couldn't generate a response."
    };

    // Save conversation to database
    const savedConversationId = await saveConversation(userMessage, assistantMessage, conversationId);

    if (!isPro) {
      await increaseApiLimit();
    }    return NextResponse.json({
      ...assistantMessage,
      conversationId: savedConversationId
    });
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

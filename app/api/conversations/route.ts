import { NextResponse } from "next/server";
import { getConversation, getUserConversations } from "@/lib/conversation";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('id');

    if (conversationId) {
      // Get specific conversation
      const conversation = await getConversation(conversationId);
      
      if (!conversation) {
        return new NextResponse("Conversation not found", { status: 404 });
      }

      return NextResponse.json(conversation);
    } else {
      // Get all user conversations
      const conversations = await getUserConversations();
      return NextResponse.json(conversations);
    }
  } catch (error) {
    console.log("[CONVERSATIONS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

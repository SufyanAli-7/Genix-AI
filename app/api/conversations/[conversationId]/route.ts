import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteConversation } from "@/lib/conversation";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { conversationId } = await context.params;

    if (!conversationId) {
      return new NextResponse("Conversation ID is required", { status: 400 });
    }

    console.log("[CONVERSATION_DELETE]", `Deleting conversation with ID: ${conversationId}`);
    await deleteConversation(conversationId);
    console.log("[CONVERSATION_DELETE]", "Conversation deleted successfully");

    return new NextResponse("Conversation deleted", { status: 200 });
  } catch (error) {
    console.log("[CONVERSATION_DELETE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

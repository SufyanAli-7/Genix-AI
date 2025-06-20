import { auth } from '@clerk/nextjs/server';
import prismadb from './prismadb';

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface PrismaConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaMessage {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: Date;
}

interface ConversationWithMessages extends PrismaConversation {
  messages: PrismaMessage[];
}

export const saveConversation = async (userMessage: ChatMessage, assistantMessage: ChatMessage, conversationId?: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  let conversation;
  if (conversationId) {
    // Update existing conversation
    conversation = await prismadb.conversation.findFirst({
      where: {
        id: conversationId,
        userId
      }
    }) as PrismaConversation | null;

    if (!conversation) {
      throw new Error('Conversation not found');
    }  } else {
    // Create new conversation
    const title = userMessage.content.slice(0, 50) + '...' || 'New Conversation';
    
    conversation = await prismadb.conversation.create({
      data: {
        userId,
        title
      }
    }) as PrismaConversation;
  }
  // Save user message first
  await prismadb.message.create({
    data: {
      conversationId: conversation.id,
      role: userMessage.role,
      content: userMessage.content
    }
  });

  // Then save assistant message
  await prismadb.message.create({
    data: {
      conversationId: conversation.id,
      role: assistantMessage.role,
      content: assistantMessage.content
    }
  });

  return conversation.id;
};

export const getConversation = async (conversationId: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  const conversation = await prismadb.conversation.findFirst({
    where: {
      id: conversationId,
      userId
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  }) as ConversationWithMessages | null;

  if (!conversation) {
    return null;
  }
  return {
    id: conversation.id,
    messages: conversation.messages.map((message: PrismaMessage) => ({
      role: message.role as "user" | "assistant" | "system",
      content: message.content
    }))
  };
};

export const getUserConversations = async () => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  const conversations = await prismadb.conversation.findMany({
    where: {
      userId
    },
    orderBy: {
      updatedAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return conversations;
};

export const deleteConversation = async (conversationId: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  const conversation = await prismadb.conversation.delete({
    where: {
      id: conversationId,
      userId // Ensure user can only delete their own conversations
    }
  });

  return conversation;
};

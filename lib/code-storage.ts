import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export const saveCodeGeneration = async (messages: Array<{role: string; content: string}>, title?: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Generate title from first user message if not provided
  const firstUserMessage = messages.find(msg => msg.role === "user");
  const generatedTitle = title || (firstUserMessage?.content.slice(0, 50) + "..." || "Code Generation");

  const codeGeneration = await prismadb.codeGeneration.create({
    data: {
      userId,
      title: generatedTitle,
      messages: {
        create: messages.map(message => ({
          role: message.role,
          content: message.content
        }))
      }
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });

  return codeGeneration;
};

export const getUserCodeGenerations = async (limit = 50) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const codeGenerations = await prismadb.codeGeneration.findMany({
    where: {
      userId
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: limit,
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });

  return codeGenerations;
};

export const getCodeGenerationById = async (id: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const codeGeneration = await prismadb.codeGeneration.findFirst({
    where: {
      id,
      userId
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });

  return codeGeneration;
};

export const deleteCodeGeneration = async (id: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const codeGeneration = await prismadb.codeGeneration.delete({
    where: {
      id,
      userId // Ensure user can only delete their own code generations
    }
  });

  return codeGeneration;
};

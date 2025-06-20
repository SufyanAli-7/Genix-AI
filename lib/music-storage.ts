import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export const saveMusic = async (prompt: string, musicUrl: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const music = await prismadb.music.create({
    data: {
      userId,
      prompt,
      musicUrl,
    }
  });

  return music;
};

export const getUserMusic = async (limit = 50) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const music = await prismadb.music.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });

  return music;
};

export const deleteMusic = async (musicId: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const music = await prismadb.music.delete({
    where: {
      id: musicId,
      userId // Ensure user can only delete their own music
    }
  });

  return music;
};

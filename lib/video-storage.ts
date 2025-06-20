import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

interface VideoData {
  prompt: string;
  videoUrl: string;
}

export const saveVideo = async (videoData: VideoData) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const video = await prismadb.video.create({
    data: {
      userId,
      prompt: videoData.prompt,
      videoUrl: videoData.videoUrl,
    }
  });

  return video;
};

export const getUserVideos = async (limit = 50) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const videos = await prismadb.video.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });

  return videos;
};

export const deleteVideo = async (videoId: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const video = await prismadb.video.delete({
    where: {
      id: videoId,
      userId // Ensure user can only delete their own videos
    }
  });

  return video;
};

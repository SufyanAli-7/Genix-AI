import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

interface ImageData {
  prompt: string;
  imageUrl: string;
  amount?: string;
  resolution?: string;
}

export const saveImage = async (imageData: ImageData) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const image = await prismadb.image.create({
    data: {
      userId,
      prompt: imageData.prompt,
      imageUrl: imageData.imageUrl,
      amount: imageData.amount,
      resolution: imageData.resolution,
    }
  });

  return image;
};

export const saveMultipleImages = async (
  prompt: string,
  imageUrls: string[],
  amount?: string,
  resolution?: string
) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const images = await Promise.all(
    imageUrls.map(imageUrl =>
      prismadb.image.create({
        data: {
          userId,
          prompt,
          imageUrl,
          amount,
          resolution,
        }
      })
    )
  );

  return images;
};

export const getUserImages = async (limit = 50) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const images = await prismadb.image.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });

  return images;
};

export const deleteImage = async (imageId: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const image = await prismadb.image.delete({
    where: {
      id: imageId,
      userId // Ensure user can only delete their own images
    }
  });

  return image;
};

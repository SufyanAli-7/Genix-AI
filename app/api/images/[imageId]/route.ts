import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteImage } from "@/lib/image-storage";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { imageId } = await params;

    if (!imageId) {
      return new NextResponse("Image ID is required", { status: 400 });
    }

    await deleteImage(imageId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[IMAGE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

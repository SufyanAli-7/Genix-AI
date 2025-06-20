import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteVideo } from "@/lib/video-storage";

export async function DELETE(
  req: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { videoId } = await params;

    if (!videoId) {
      return new NextResponse("Video ID is required", { status: 400 });
    }

    await deleteVideo(videoId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[VIDEO_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

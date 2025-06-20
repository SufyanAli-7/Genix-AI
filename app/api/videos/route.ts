import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserVideos } from "@/lib/video-storage";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const videos = await getUserVideos();
    
    return NextResponse.json(videos);
  } catch (error) {
    console.log("[VIDEOS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserMusic } from "@/lib/music-storage";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const music = await getUserMusic();
    
    return NextResponse.json(music);
  } catch (error) {
    console.log("[MUSIC_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteMusic } from "@/lib/music-storage";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ musicId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { musicId } = await context.params;

    if (!musicId) {
      return new NextResponse("Music ID is required", { status: 400 });
    }

    console.log("[MUSIC_DELETE]", `Deleting music with ID: ${musicId}`);
    await deleteMusic(musicId);
    console.log("[MUSIC_DELETE]", "Music deleted successfully");

    return new NextResponse("Music deleted", { status: 200 });
  } catch (error) {
    console.log("[MUSIC_DELETE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

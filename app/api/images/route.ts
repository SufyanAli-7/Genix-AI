import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserImages } from "@/lib/image-storage";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const images = await getUserImages();
    
    return NextResponse.json(images);
  } catch (error) {
    console.log("[IMAGES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

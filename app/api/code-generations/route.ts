import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserCodeGenerations, getCodeGenerationById } from "@/lib/code-storage";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (id) {
      // Get specific code generation
      const codeGeneration = await getCodeGenerationById(id);
      if (!codeGeneration) {
        return new NextResponse("Code generation not found", { status: 404 });
      }
      return NextResponse.json(codeGeneration);
    } else {
      // Get all user's code generations
      const codeGenerations = await getUserCodeGenerations();
      return NextResponse.json(codeGenerations);
    }
  } catch (error) {
    console.log("[CODE_GENERATIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

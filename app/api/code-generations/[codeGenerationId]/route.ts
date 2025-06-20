import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteCodeGeneration } from "@/lib/code-storage";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ codeGenerationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { codeGenerationId } = await context.params;

    if (!codeGenerationId) {
      return new NextResponse("Code generation ID is required", { status: 400 });
    }

    console.log("[CODE_GENERATION_DELETE]", `Deleting code generation with ID: ${codeGenerationId}`);
    await deleteCodeGeneration(codeGenerationId);
    console.log("[CODE_GENERATION_DELETE]", "Code generation deleted successfully");

    return new NextResponse("Code generation deleted", { status: 200 });
  } catch (error) {
    console.log("[CODE_GENERATION_DELETE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

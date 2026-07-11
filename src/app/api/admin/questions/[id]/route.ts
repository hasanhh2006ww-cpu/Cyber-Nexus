import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { text, options, correctAnswer, quizId } = body;

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (text !== undefined) updateData.text = text;
    if (options !== undefined) {
      updateData.options = Array.isArray(options)
        ? JSON.stringify(options)
        : options;
    }
    if (correctAnswer !== undefined)
      updateData.correctAnswer = Number(correctAnswer);
    if (quizId !== undefined) updateData.quizId = quizId;

    const question = await prisma.question.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}

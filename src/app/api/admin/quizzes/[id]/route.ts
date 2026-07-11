import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, passingScore, lessonId } = body;

    const existing = await prisma.quiz.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (lessonId && lessonId !== existing.lessonId) {
      const lessonConflict = await prisma.quiz.findUnique({
        where: { lessonId },
      });
      if (lessonConflict) {
        return NextResponse.json(
          { error: "A quiz already exists for this lesson" },
          { status: 400 }
        );
      }
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(passingScore !== undefined && { passingScore }),
        ...(lessonId !== undefined && { lessonId }),
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
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

    const existing = await prisma.quiz.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    await prisma.quiz.delete({ where: { id } });

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}

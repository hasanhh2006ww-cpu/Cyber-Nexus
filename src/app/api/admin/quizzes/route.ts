import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, passingScore, lessonId } = body;

    if (!title || !lessonId) {
      return NextResponse.json(
        { error: "title and lessonId are required" },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { lessonId },
    });
    if (existingQuiz) {
      return NextResponse.json(
        { error: "A quiz already exists for this lesson" },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        passingScore: passingScore ?? 70,
        lessonId,
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}

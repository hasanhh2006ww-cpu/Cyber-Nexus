import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId, answers } = await req.json();

    if (!quizId || !answers) {
      return NextResponse.json(
        { error: "Quiz ID and answers are required" },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    let correct = 0;
    const total = quiz.questions.length;

    for (const question of quiz.questions) {
      const answer = answers.find(
        (a: { questionId: string; selectedOption: number }) =>
          a.questionId === question.id
      );
      if (answer && answer.selectedOption === question.correctAnswer) {
        correct++;
      }
    }

    const score = Math.round((correct / total) * 100);
    const passed = score >= quiz.passingScore;

    const result = await prisma.result.create({
      data: {
        userId: session.user.id,
        quizId,
        score,
        answers: JSON.stringify(answers),
        passed,
      },
    });

    return NextResponse.json({
      result,
      score,
      total,
      correct,
      passed,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    const results = await prisma.result.findMany({
      where: {
        userId: session.user.id,
        ...(quizId ? { quizId } : {}),
      },
      include: {
        quiz: {
          include: {
            lesson: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

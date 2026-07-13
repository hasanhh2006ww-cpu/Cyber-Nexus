import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ("response" in auth) return auth.response;
    const user = auth.user;

    const { quizId, answers } = await req.json();

    if (!quizId || !answers) {
      return NextResponse.json(
        { error: "Quiz ID and answers are required" },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true, lesson: { select: { courseId: true } } },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const courseId = quiz.lesson?.courseId;
    if (courseId) {
      const enrollment = await prisma.enrollment.findFirst({
        where: { userId: user.id, courseId },
        select: { id: true },
      });

      if (!enrollment) {
        return NextResponse.json({ error: "NOT_ENROLLED" }, { status: 403 });
      }
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
        userId: user.id,
        quizId,
        score,
        answers: JSON.stringify(answers),
        passed,
      },
    });

    return NextResponse.json({ result, score, total, correct, passed });
  } catch (error) {
    console.error("[RESULTS POST] ERROR:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ("response" in auth) return auth.response;
    const user = auth.user;

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    const results = await prisma.result.findMany({
      where: {
        userId: user.id,
        ...(quizId ? { quizId } : {}),
      },
      include: {
        quiz: {
          include: { lesson: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("[RESULTS GET] ERROR:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

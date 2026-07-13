import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const auth = await requireAuth(req);
    if ("response" in auth) return auth.response;
    const user = auth.user;

    const { lessonId } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true, isPreview: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (!lesson.isPreview) {
      const enrollmentRows = await prisma.$queryRawUnsafe(
        "SELECT id FROM enrollments WHERE userId = ? AND courseId = ? LIMIT 1",
        user.id,
        lesson.courseId
      ) as Array<{ id: string }>;

      if (!Array.isArray(enrollmentRows) || enrollmentRows.length === 0) {
        return NextResponse.json({ error: "NOT_ENROLLED" }, { status: 403 });
      }
    }

    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ GET] ERROR:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

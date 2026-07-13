import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { id, lessonId } = await params;

    const auth = await requireAuth(req);
    if ("response" in auth) return auth.response;
    const user = auth.user;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            sections: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                lessons: {
                  orderBy: { order: "asc" },
                  select: { id: true, title: true, order: true, duration: true, contentType: true, isPreview: true },
                },
              },
            },
            lessons: {
              orderBy: { order: "asc" },
              where: { sectionId: null },
              select: { id: true, title: true, order: true, duration: true, contentType: true, isPreview: true },
            },
          },
        },
        quiz: {
          include: {
            questions: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!lesson || lesson.courseId !== id) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (!lesson.isPreview) {
      const enrollmentRows = await prisma.$queryRawUnsafe(
        "SELECT id FROM enrollments WHERE userId = ? AND courseId = ? LIMIT 1",
        user.id,
        id
      ) as Array<{ id: string }>;

      if (!Array.isArray(enrollmentRows) || enrollmentRows.length === 0) {
        return NextResponse.json({ error: "NOT_ENROLLED" }, { status: 403 });
      }
    }

    let completed = false;
    const progressRows = await prisma.$queryRawUnsafe(
      "SELECT completed FROM progress WHERE userId = ? AND lessonId = ? LIMIT 1",
      user.id,
      lessonId
    ) as Array<{ completed: boolean }>;

    if (Array.isArray(progressRows) && progressRows.length > 0) {
      completed = !!progressRows[0].completed;
    }

    return NextResponse.json({ lesson, completed });
  } catch (error) {
    console.error("[LESSON GET] ERROR:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

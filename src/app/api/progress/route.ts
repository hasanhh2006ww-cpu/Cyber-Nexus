import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ("response" in auth) return auth.response;
    const user = auth.user;

    const { lessonId, completed } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true, isPreview: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (!lesson.isPreview) {
      const enrollment = await prisma.enrollment.findFirst({
        where: { userId: user.id, courseId: lesson.courseId },
        select: { id: true },
      });

      if (!enrollment) {
        return NextResponse.json({ error: "NOT_ENROLLED" }, { status: 403 });
      }
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      update: {
        completed: completed ?? true,
        lastAccessed: new Date(),
      },
      create: {
        userId: user.id,
        lessonId,
        completed: completed ?? true,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[PROGRESS POST] ERROR:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ("response" in auth) return auth.response;
    const user = auth.user;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const progress = await prisma.progress.findMany({
      where: {
        userId: user.id,
        ...(courseId ? { lesson: { courseId } } : {}),
      },
      include: {
        lesson: {
          include: { course: true },
        },
      },
      orderBy: { lastAccessed: "desc" },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[PROGRESS GET] ERROR:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ("response" in auth) return auth.response;
    const user = auth.user;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (courseId) {
      const enrollment = await prisma.enrollment.findFirst({
        where: { userId: user.id, courseId },
      });

      const enrolled = enrollment !== null;
      return NextResponse.json({ enrolled, enrollmentId: enrolled ? enrollment.id : null });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true, title: true, thumbnail: true, description: true,
            category: true, difficulty: true, duration: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("[ENROLLMENTS GET] ERROR:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ("response" in auth) return auth.response;
    const user = auth.user;

    let body: { courseId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const courseId = body.courseId;

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const existing = await prisma.enrollment.findFirst({
      where: { userId: user.id, courseId },
    });

    if (existing) {
      return NextResponse.json({ enrolled: true, enrollmentId: existing.id });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
      },
    });

    await prisma.course.update({
      where: { id: courseId },
      data: { studentCount: { increment: 1 } },
    });

    return NextResponse.json({ enrolled: true, enrollmentId: enrollment.id }, { status: 201 });
  } catch (error) {
    console.error("[ENROLLMENTS POST] ERROR:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ("response" in auth) return auth.response;
    const user = auth.user;

    let body: { courseId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const courseId = body.courseId;
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: user.id, courseId },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
    }

    const lessonIds = await prisma.lesson.findMany({
      where: { courseId },
      select: { id: true },
    });
    const ids = lessonIds.map((l) => l.id);

    if (ids.length > 0) {
      await prisma.progress.deleteMany({
        where: { userId: user.id, lessonId: { in: ids } },
      });

      const quizIds = await prisma.quiz.findMany({
        where: { lessonId: { in: ids } },
        select: { id: true },
      });
      const qIds = quizIds.map((q) => q.id);
      if (qIds.length > 0) {
        await prisma.result.deleteMany({
          where: { userId: user.id, quizId: { in: qIds } },
        });
      }
    }

    await prisma.enrollment.deleteMany({
      where: { userId: user.id, courseId },
    });

    await prisma.course.update({
      where: { id: courseId },
      data: { studentCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ENROLLMENTS DELETE] ERROR:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

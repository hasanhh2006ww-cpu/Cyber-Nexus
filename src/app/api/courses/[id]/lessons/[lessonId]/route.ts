import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { id, lessonId } = await params;
    const session = await auth();

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
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    let completed = false;
    if (session?.user?.id) {
      const progress = await prisma.progress.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId,
          },
        },
      });
      completed = progress?.completed ?? false;
    }

    return NextResponse.json({ lesson, completed });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

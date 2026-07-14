import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id, isPublished: true },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true, title: true, contentType: true, duration: true,
                order: true, isPreview: true, videoUrl: true, fileUrl: true,
                externalUrl: true, codeLanguage: true,
              },
            },
          },
        },
        lessons: {
          orderBy: { order: "asc" },
          where: { sectionId: null },
          select: {
            id: true, title: true, contentType: true, duration: true,
            order: true, isPreview: true, videoUrl: true, fileUrl: true,
            externalUrl: true, codeLanguage: true,
          },
        },
        learningPaths: {
          include: {
            learningPath: {
              select: { id: true, title: true, slug: true, description: true, difficulty: true, thumbnail: true },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

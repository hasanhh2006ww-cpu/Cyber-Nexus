import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, content, contentType, videoUrl, fileUrl, fileType,
      externalUrl, codeContent, codeLanguage, order, duration,
      isPreview, courseId, sectionId,
    } = body;

    if (!title || !courseId) {
      return NextResponse.json(
        { error: "title and courseId are required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const maxOrder = await prisma.lesson.aggregate({
      where: { courseId, sectionId: sectionId || null },
      _max: { order: true },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content: content || "",
        contentType: contentType || "text",
        videoUrl: videoUrl || "",
        fileUrl: fileUrl || "",
        fileType: fileType || "",
        externalUrl: externalUrl || "",
        codeContent: codeContent || "",
        codeLanguage: codeLanguage || "",
        order: order ?? ((maxOrder._max.order ?? 0) + 1),
        duration: duration || "",
        isPreview: isPreview || false,
        courseId,
        sectionId: sectionId || null,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { learningPathId, courseId, order } = body;

    if (!learningPathId || !courseId) {
      return NextResponse.json({ error: "learningPathId and courseId are required" }, { status: 400 });
    }

    const existing = await prisma.learningPathCourse.findUnique({
      where: { learningPathId_courseId: { learningPathId, courseId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Course already in path" }, { status: 409 });
    }

    const maxOrder = await prisma.learningPathCourse.aggregate({
      where: { learningPathId },
      _max: { order: true },
    });

    const lpc = await prisma.learningPathCourse.create({
      data: {
        learningPathId,
        courseId,
        order: order ?? ((maxOrder._max.order ?? 0) + 1),
      },
    });

    return NextResponse.json(lpc, { status: 201 });
  } catch (error) {
    console.error("Error adding course to path:", error);
    return NextResponse.json({ error: "Failed to add course" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { learningPathId, courses } = body;

    if (!learningPathId || !Array.isArray(courses)) {
      return NextResponse.json({ error: "learningPathId and courses array required" }, { status: 400 });
    }

    for (const c of courses) {
      if (c.courseId && typeof c.order === "number") {
        await prisma.learningPathCourse.updateMany({
          where: { learningPathId, courseId: c.courseId },
          data: { order: c.order },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering courses:", error);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { learningPathId, courseId } = body;

    if (!learningPathId || !courseId) {
      return NextResponse.json({ error: "learningPathId and courseId are required" }, { status: 400 });
    }

    await prisma.learningPathCourse.deleteMany({
      where: { learningPathId, courseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing course from path:", error);
    return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  }
}

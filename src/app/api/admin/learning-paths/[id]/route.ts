import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const path = await prisma.learningPath.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: { order: "asc" },
          include: {
            course: {
              select: { id: true, title: true, thumbnail: true, description: true, difficulty: true, duration: true, category: true },
            },
          },
        },
      },
    });
    if (!path) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(path);
  } catch (error) {
    console.error("Error fetching learning path:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, slug, description, descriptionLong, thumbnail, banner, difficulty, estimatedHours, isPublished, isFeatured, sortOrder } = body;

    const updateData: Record<string, unknown> = {};
    const allowed = ["title", "slug", "description", "descriptionLong", "thumbnail", "banner", "difficulty", "estimatedHours", "isPublished", "isFeatured", "sortOrder"];
    for (const field of allowed) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const path = await prisma.learningPath.update({ where: { id }, data: updateData });
    return NextResponse.json(path);
  } catch (error) {
    console.error("Error updating learning path:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.learningPathCourse.deleteMany({ where: { learningPathId: id } });
    await prisma.learningPath.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting learning path:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

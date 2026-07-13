import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const paths = await prisma.learningPath.findMany({
      include: {
        _count: { select: { courses: true } },
        courses: {
          include: {
            course: { select: { id: true, title: true, thumbnail: true } },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(paths);
  } catch (error) {
    console.error("Error fetching learning paths:", error);
    return NextResponse.json({ error: "Failed to fetch learning paths" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, description, descriptionLong, thumbnail, banner, difficulty, estimatedHours, isPublished, isFeatured, sortOrder } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
    }

    const path = await prisma.learningPath.create({
      data: {
        title, slug,
        description: description || "",
        descriptionLong: descriptionLong || "",
        thumbnail: thumbnail || null,
        banner: banner || null,
        difficulty: difficulty || "beginner",
        estimatedHours: estimatedHours || 0,
        isPublished: isPublished || false,
        isFeatured: isFeatured || false,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(path, { status: 201 });
  } catch (error) {
    console.error("Error creating learning path:", error);
    return NextResponse.json({ error: "Failed to create learning path" }, { status: 500 });
  }
}

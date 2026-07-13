import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const paths = await prisma.learningPath.findMany({
      where: { isPublished: true },
      include: {
        courses: {
          orderBy: { order: "asc" },
          include: {
            course: {
              select: {
                id: true, title: true, thumbnail: true, difficulty: true,
                duration: true, category: true,
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(paths);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

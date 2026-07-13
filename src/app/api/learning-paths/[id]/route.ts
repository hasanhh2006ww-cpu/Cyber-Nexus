import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const path = await prisma.learningPath.findFirst({
      where: { OR: [{ id }, { slug: id }], isPublished: true },
      include: {
        courses: {
          orderBy: { order: "asc" },
          include: {
            course: {
              include: {
                _count: { select: { lessons: true } },
                lessons: { select: { id: true, duration: true } },
              },
            },
          },
        },
      },
    });

    if (!path) {
      return NextResponse.json({ error: "Learning path not found" }, { status: 404 });
    }

    return NextResponse.json(path);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

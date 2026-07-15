import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [students, courses, lessons, learningPaths] = await Promise.all([
      prisma.user.count({ where: { role: "student" } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.lesson.count(),
      prisma.learningPath.count({ where: { isPublished: true } }),
    ]);

    return NextResponse.json({ students, courses, lessons, learningPaths });
  } catch {
    return NextResponse.json({ students: 0, courses: 0, lessons: 0, learningPaths: 0 });
  }
}

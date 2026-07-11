import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalUsers,
      totalCourses,
      totalLessons,
      totalQuizzes,
      totalQuestions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.quiz.count(),
      prisma.question.count(),
    ]);

    const activeUsers = await prisma.progress.findMany({
      select: { userId: true },
      distinct: ["userId"],
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const coursesWithCounts = await prisma.course.findMany({
      select: {
        title: true,
        lessons: {
          select: {
            progress: {
              select: { userId: true },
            },
          },
        },
      },
    });

    let mostStudiedCourse: { title: string; enrollments: number } | null = null;
    if (coursesWithCounts.length > 0) {
      const enriched = coursesWithCounts.map((course) => {
        const uniqueUsers = new Set(
          course.lessons.flatMap((l) => l.progress.map((p) => p.userId))
        );
        return { title: course.title, enrollments: uniqueUsers.size };
      });
      enriched.sort((a, b) => b.enrollments - a.enrollments);
      mostStudiedCourse = enriched[0];
    }

    const allResults = await prisma.result.findMany({
      select: { score: true },
    });
    const averageQuizScore =
      allResults.length > 0
        ? allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
        : 0;

    return NextResponse.json({
      totalUsers,
      totalCourses,
      totalLessons,
      totalQuizzes,
      totalQuestions,
      activeUsers: activeUsers.length,
      recentUsers,
      mostStudiedCourse,
      averageQuizScore: Math.round(averageQuizScore * 100) / 100,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

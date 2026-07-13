"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen, CheckCircle, Trophy, TrendingUp, Clock, Play, ArrowLeft, LayoutDashboard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { handleSessionExpired } from "@/lib/auth-client";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  totalLessons: number;
  completedLessons: number;
  percent: number;
  nextLessonId: string | null;
  lastAccessed?: string | null;
}

interface ActivityItem {
  id: string;
  type: "lesson_completed" | "quiz_passed" | "quiz_failed";
  title: string;
  subtitle: string;
  timestamp: string;
  courseId: string;
}

interface DashboardData {
  userName: string;
  enrolledCount: number;
  totalLessons: number;
  completedLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  topCourse: EnrolledCourse | null;
  activities: ActivityItem[];
}

function computeData(
  progressItems: RawProgress[],
  results: RawResult[],
  userName: string,
): DashboardData {
  const courseMap = new Map<string, {
    title: string; description: string; thumbnail: string | null;
    lessons: Map<string, { id: string; order: number; completed: boolean; lastAccessed: string }>;
  }>();

  for (const p of progressItems) {
    const cid = p.lesson.courseId;
    if (!courseMap.has(cid)) {
      courseMap.set(cid, {
        title: p.lesson.course.title,
        description: p.lesson.course.description,
        thumbnail: p.lesson.course.thumbnail,
        lessons: new Map(),
      });
    }
    const entry = courseMap.get(cid)!;
    entry.lessons.set(p.lesson.id, {
      id: p.lesson.id, order: p.lesson.order,
      completed: p.completed, lastAccessed: p.lastAccessed,
    });
  }

  const enrolledCourses: EnrolledCourse[] = [];
  const courseLessonCounts = new Map<string, { total: number; completed: number }>();

  for (const [courseId, data] of courseMap) {
    const sorted = Array.from(data.lessons.values()).sort((a, b) => a.order - b.order);
    const total = sorted.length;
    const completed = sorted.filter((l) => l.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    let nextLessonId: string | null = null;
    for (const l of sorted) {
      if (!l.completed) { nextLessonId = l.id; break; }
    }

    const lastAccessedArr = sorted
      .map((l) => l.lastAccessed)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    enrolledCourses.push({
      id: courseId, title: data.title, description: data.description,
      thumbnail: data.thumbnail, totalLessons: total, completedLessons: completed,
      percent, nextLessonId, lastAccessed: lastAccessedArr[0] || null,
    });

    courseLessonCounts.set(courseId, { total, completed });
  }

  enrolledCourses.sort((a, b) => {
    const aTime = a.lastAccessed;
    const bTime = b.lastAccessed;
    if (aTime && bTime) return new Date(bTime).getTime() - new Date(aTime).getTime();
    if (aTime) return -1;
    return 1;
  });

  const topCourse = enrolledCourses[0] || null;
  const totalEnrolled = enrolledCourses.length;
  const allTotalLessons = Array.from(courseLessonCounts.values()).reduce((a, c) => a + c.total, 0);
  const allCompletedLessons = Array.from(courseLessonCounts.values()).reduce((a, c) => a + c.completed, 0);
  const quizzesPassed = results.filter((r) => r.passed).length;
  const totalQuizzes = results.length;

  const activities: ActivityItem[] = [];
  for (const p of progressItems) {
    if (p.completed) {
      activities.push({
        id: `p-${p.id}`, type: "lesson_completed",
        title: `أكملت درس "${p.lesson.title}"`,
        subtitle: p.lesson.course.title,
        timestamp: p.lastAccessed, courseId: p.lesson.courseId,
      });
    }
  }
  for (const r of results) {
    activities.push({
      id: `r-${r.id}`,
      type: r.passed ? "quiz_passed" : "quiz_failed",
      title: r.passed
        ? `اجتزت اختبار "${r.quiz.lesson.title}"`
        : `لم تجتز اختبار "${r.quiz.lesson.title}"`,
      subtitle: r.quiz.lesson.course.title,
      timestamp: r.createdAt, courseId: r.quiz.lesson.courseId,
    });
  }
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    userName, enrolledCount: totalEnrolled,
    totalLessons: allTotalLessons, completedLessons: allCompletedLessons,
    quizzesPassed, totalQuizzes,
    topCourse, activities: activities.slice(0, 3),
  };
}

interface RawProgress {
  id: string; completed: boolean; lastAccessed: string;
  lesson: {
    id: string; title: string; order: number;
    courseId: string;
    course: {
      id: string; title: string; description: string; thumbnail: string | null;
      sections: { lessons: { id: string; order: number }[] }[];
      lessons: { id: string; order: number }[];
    };
  };
}

interface RawResult {
  id: string; score: number; passed: boolean; createdAt: string;
  quiz: { lesson: { title: string; courseId: string; course: { title: string } } };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [progressRes, resultsRes, sessionRes] = await Promise.all([
          fetch("/api/progress"),
          fetch("/api/results"),
          fetch("/api/auth/session"),
        ]);

        if (progressRes.status === 401) {
          const data = await progressRes.json().catch(() => ({}));
          if (handleSessionExpired(data)) return;
        }
        if (resultsRes.status === 401) {
          const data = await resultsRes.json().catch(() => ({}));
          if (handleSessionExpired(data)) return;
        }

        const progress: RawProgress[] = progressRes.ok ? await progressRes.json() : [];
        const results: RawResult[] = resultsRes.ok ? await resultsRes.json() : [];
        const session = await sessionRes.json();
        const userName = session?.user?.name?.split(" ")[0] || "طالب";

        setData(computeData(progress, results, userName));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-64 bg-[var(--secondary)] rounded" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-[var(--secondary)] rounded-[var(--radius)]" />
                ))}
              </div>
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 h-72 bg-[var(--secondary)] rounded-[var(--radius)]" />
                <div className="lg:col-span-2 h-72 bg-[var(--secondary)] rounded-[var(--radius)]" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const d = data!;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              مرحبًا، <span className="text-[var(--primary)]">{d.userName}</span> 👋
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {d.enrolledCount > 0
                ? `استمر في التعلم، أنت مسجل في ${d.enrolledCount} ${d.enrolledCount === 1 ? "دورة" : "دورات"}.`
                : "ابدأ رحلة التعلم الخاصة بك اليوم."}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              {
                icon: BookOpen, color: "text-blue-400",
                label: "الدورات المسجلة",
                value: d.enrolledCount,
              },
              {
                icon: TrendingUp, color: "text-violet-400",
                label: "التقدم الكلي",
                value: d.totalLessons > 0
                  ? `${Math.round((d.completedLessons / d.totalLessons) * 100)}%`
                  : "0%",
              },
              {
                icon: CheckCircle, color: "text-green-400",
                label: "الدروس المكتملة",
                value: `${d.completedLessons} / ${d.totalLessons}`,
              },
              {
                icon: Trophy, color: "text-amber-400",
                label: "الاختبارات المجتازة",
                value: `${d.quizzesPassed} / ${d.totalQuizzes}`,
              },
            ].map((stat, i) => (
              <Card key={stat.label} className="border-[var(--border)] bg-[var(--card)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)]`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--muted-foreground)] truncate">{stat.label}</p>
                      <p className="text-xl font-bold text-[var(--foreground)] leading-tight">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Two columns */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid lg:grid-cols-5 gap-6"
          >
            {/* Right - Continue Learning (3 cols) */}
            <div className="lg:col-span-3">
              {d.topCourse ? (
                <Card className="border-[var(--border)] bg-[var(--card)] h-full">
                  <CardContent className="p-0 h-full flex flex-col">
                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden rounded-t-[var(--radius)]">
                      {d.topCourse.thumbnail ? (
                        <img
                          src={d.topCourse.thumbnail}
                          alt={d.topCourse.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card)] flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-[var(--primary)]/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col">
                      <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                        {d.topCourse.title}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-1">
                        {d.topCourse.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mb-3">
                        <span>{d.topCourse.totalLessons} درس</span>
                        <span className="h-1 w-1 rounded-full bg-[var(--muted-foreground)]" />
                        <span>{d.topCourse.completedLessons} مكتمل</span>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-[var(--muted-foreground)]">التقدم</span>
                          <span className="font-medium text-[var(--primary)]">{d.topCourse.percent}%</span>
                        </div>
                        <Progress value={d.topCourse.percent} className="h-2 mb-4" />

                        <Link href={
                          d.topCourse.nextLessonId
                            ? `/courses/${d.topCourse.id}/lesson/${d.topCourse.nextLessonId}`
                            : `/courses/${d.topCourse.id}`
                        }>
                          <Button className="w-full bg-[var(--primary)] text-[var(--primary-foreground)]">
                            <Play className="ml-2 h-4 w-4" />
                            متابعة الدورة
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-[var(--border)] bg-[var(--card)] h-full">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <BookOpen className="h-12 w-12 text-[var(--muted-foreground)]/30 mb-4" />
                    <p className="text-[var(--muted-foreground)] text-sm">لم تسجل في أي دورة بعد.</p>
                    <Link href="/courses">
                      <Button variant="outline" className="mt-4">
                        تصفح الدورات
                        <ArrowLeft className="mr-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Left - Recent Activity (2 cols) */}
            <div className="lg:col-span-2">
              <Card className="border-[var(--border)] bg-[var(--card)] h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">النشاط الأخير</h3>
                    <Clock className="h-4 w-4 text-[var(--muted-foreground)]" />
                  </div>

                  {d.activities.length > 0 ? (
                    <div className="space-y-3">
                      {d.activities.map((activity) => (
                        <Link
                          key={activity.id}
                          href={`/courses/${activity.courseId}`}
                          className="flex items-start gap-3 p-3 rounded-lg bg-[var(--secondary)]/50 hover:bg-[var(--secondary)] transition-colors"
                        >
                          <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            activity.type === "lesson_completed"
                              ? "bg-green-500/10 text-green-400"
                              : activity.type === "quiz_passed"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                          }`}>
                            {activity.type === "lesson_completed" ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : activity.type === "quiz_passed" ? (
                              <Trophy className="h-3.5 w-3.5" />
                            ) : (
                              <Trophy className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-[var(--foreground)] leading-snug">{activity.title}</p>
                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{activity.subtitle}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Clock className="h-10 w-10 text-[var(--muted-foreground)]/20 mb-3" />
                      <p className="text-sm text-[var(--muted-foreground)] text-center">
                        لا يوجد نشاط حتى الآن.
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]/60 text-center mt-1">
                        ابدأ أول درس ليظهر نشاطك هنا.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

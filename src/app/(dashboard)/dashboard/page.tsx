"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Trophy,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Progress as ProgressType, Course } from "@/types";

interface DashboardStats {
  totalCourses: number;
  completedLessons: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  averageScore: number;
  recentProgress: (ProgressType & {
    lesson: {
      title: string;
      course: { title: string; id: string };
    };
  })[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [progressRes, coursesRes, resultsRes] = await Promise.all([
          fetch("/api/progress"),
          fetch("/api/courses"),
          fetch("/api/results"),
        ]);

        const progress = await progressRes.json();
        const coursesData = await coursesRes.json();
        const results = await resultsRes.json();

        setCourses(coursesData);

        const completedLessons = progress.filter(
          (p: ProgressType) => p.completed
        ).length;
        const totalLessons = coursesData.reduce(
          (acc: number, c: Course) => acc + (c._count?.lessons || 0),
          0
        );
        const quizzesPassed = results.filter(
          (r: { passed: boolean }) => r.passed
        ).length;
        const averageScore =
          results.length > 0
            ? Math.round(
                results.reduce(
                  (acc: number, r: { score: number }) => acc + r.score,
                  0
                ) / results.length
              )
            : 0;

        setStats({
          totalCourses: coursesData.length,
          completedLessons,
          totalLessons,
          quizzesPassed,
          totalQuizzes: results.length,
          averageScore,
          recentProgress: progress.slice(0, 5),
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
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
          <main className="flex-1 p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 bg-[var(--secondary)] rounded" />
              <div className="grid md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-[var(--secondary)] rounded-[var(--radius)]" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "الدورات المسجلة",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "text-blue-400",
    },
    {
      title: "الدروس المكتملة",
      value: `${stats?.completedLessons || 0}/${stats?.totalLessons || 0}`,
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      title: "الاختبارات المجتازة",
      value: `${stats?.quizzesPassed || 0}/${stats?.totalQuizzes || 0}`,
      icon: Trophy,
      color: "text-yellow-400",
    },
    {
      title: "المتوسط العام",
      value: `${stats?.averageScore || 0}%`,
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <Card className="border-[var(--border)] bg-[var(--card)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        </div>
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="border-[var(--border)] bg-[var(--card)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-[var(--primary)]" />
                    النشاط الأخير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.recentProgress && stats.recentProgress.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentProgress.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-[var(--radius)] bg-[var(--secondary)]/50"
                        >
                          <div>
                            <p className="text-sm font-medium">{p.lesson.title}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {p.lesson.course.title}
                            </p>
                          </div>
                          <Badge
                            variant={p.completed ? "success" : "secondary"}
                          >
                            {p.completed ? "مكتمل" : "قيد التنفيذ"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                      <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                      لا يوجد نشاط بعد. ابدأ دورة لتتبع التقدم!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Continue Learning */}
              <Card className="border-[var(--border)] bg-[var(--card)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-[var(--primary)]" />
                    متابعة التعلم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {courses.length > 0 ? (
                    <div className="space-y-3">
                      {courses.slice(0, 4).map((course) => (
                        <Link
                          key={course.id}
                          href={`/courses/${course.id}`}
                          className="flex items-center justify-between p-3 rounded-[var(--radius)] bg-[var(--secondary)]/50 hover:bg-[var(--secondary)] transition-colors group"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{course.title}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {course._count?.lessons || 0} درس
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                      <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                      لا توجد دورات متاحة بعد.
                    </p>
                  )}
                  {courses.length > 4 && (
                    <Link href="/courses" className="block mt-4">
                      <Button variant="outline" className="w-full">
                        عرض جميع الدورات
                      </Button>
                    </Link>
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

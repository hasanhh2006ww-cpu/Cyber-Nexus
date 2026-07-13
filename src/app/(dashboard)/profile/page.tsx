"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  Trophy,
  TrendingUp,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { handleSessionExpired } from "@/lib/auth-client";

interface ProfileStats {
  completedLessons: number;
  totalLessons: number;
  quizzesTaken: number;
  quizzesPassed: number;
  averageScore: number;
  coursesStarted: number;
  recentResults: {
    id: string;
    score: number;
    passed: boolean;
    createdAt: string;
    quiz: {
      title: string;
      lesson: {
        title: string;
        course: { title: string };
      };
    };
  }[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [progressRes, resultsRes] = await Promise.all([
          fetch("/api/progress"),
          fetch("/api/results"),
        ]);

        if (progressRes.status === 401) {
          const data = await progressRes.json().catch(() => ({}));
          if (handleSessionExpired(data)) return;
        }
        if (resultsRes.status === 401) {
          const data = await resultsRes.json().catch(() => ({}));
          if (handleSessionExpired(data)) return;
        }

        const progress = progressRes.ok ? await progressRes.json() : [];
        const results = resultsRes.ok ? await resultsRes.json() : [];

        const completedLessons = progress.filter(
          (p: { completed: boolean }) => p.completed
        ).length;
        const uniqueCourses = new Set(
          progress.map(
            (p: { lesson: { course: { id: string } } }) =>
              p.lesson?.course?.id
          )
        ).size;
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
          completedLessons,
          totalLessons: progress.length,
          quizzesTaken: results.length,
          quizzesPassed,
          averageScore,
          coursesStarted: uniqueCourses,
          recentResults: results.slice(0, 5),
        });
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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
            {/* Profile Header */}
            <div className="flex items-center gap-6 mb-8">
              <Avatar
                fallback={session?.user?.name || ""}
                className="h-20 w-20"
              />
              <div>
                <h1 className="text-3xl font-bold">{session?.user?.name}</h1>
                <p className="text-[var(--muted-foreground)] flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {session?.user?.email}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="secondary" className="capitalize">
                    {(session?.user as { role?: string })?.role || "طالب"}
                  </Badge>
                  <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    عضو منذ {new Date().getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-[var(--secondary)] rounded-[var(--radius)] animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <Card className="border-[var(--border)] bg-[var(--card)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            الدروس المكتملة
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {stats?.completedLessons || 0}
                          </p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-400" />
                      </div>
                      <Progress
                        value={
                          stats && stats.totalLessons > 0
                            ? Math.round(
                                (stats.completedLessons / stats.totalLessons) *
                                  100
                              )
                            : 0
                        }
                        className="mt-3 h-2"
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-[var(--border)] bg-[var(--card)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            الاختبارات المجتازة
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {stats?.quizzesPassed || 0}/{stats?.quizzesTaken || 0}
                          </p>
                        </div>
                        <Trophy className="h-8 w-8 text-yellow-400" />
                      </div>
                      <Progress
                        value={
                          stats && stats.quizzesTaken > 0
                            ? Math.round(
                                (stats.quizzesPassed / stats.quizzesTaken) * 100
                              )
                            : 0
                        }
                        className="mt-3 h-2"
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-[var(--border)] bg-[var(--card)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            المتوسط العام
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {stats?.averageScore || 0}%
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-400" />
                      </div>
                      <Progress
                        value={stats?.averageScore || 0}
                        className="mt-3 h-2"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Quiz Results */}
                <Card className="border-[var(--border)] bg-[var(--card)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-[var(--primary)]" />
                      نتائج الاختبارات الأخيرة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats?.recentResults && stats.recentResults.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recentResults.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between p-3 rounded-[var(--radius)] bg-[var(--secondary)]/50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {result.quiz.lesson.course.title}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)] truncate">
                                {result.quiz.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-sm font-bold">
                                {result.score}%
                              </span>
                              <Badge
                                variant={result.passed ? "success" : "destructive"}
                              >
                                {result.passed ? "ناجح" : "راسب"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                        لا توجد نتائج اختبارات بعد. أكمل بعض الدروس وخذ الاختبارات!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

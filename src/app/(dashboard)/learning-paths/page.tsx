"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Clock, Search, Compass, Play, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { handleSessionExpired } from "@/lib/auth-client";

interface PathCourse {
  order: number;
  course: {
    id: string; title: string; thumbnail: string | null;
    difficulty: string; duration: string; category: string;
    lessons?: { id: string }[];
  };
}

interface LearningPathItem {
  id: string; title: string; slug: string; description: string;
  thumbnail: string | null; difficulty: string; estimatedHours: number;
  isFeatured: boolean; courses: PathCourse[];
}

interface ProgressItem {
  completed: boolean;
  lesson: { id: string; courseId: string };
}

interface PathProgress {
  totalLessons: number;
  completedLessons: number;
  percent: number;
}

const DIFF_MAP: Record<string, string> = {
  beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم",
};
const DIFF_COLORS: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

function computePathProgress(
  paths: LearningPathItem[],
  progressItems: ProgressItem[]
): Map<string, PathProgress> {
  const completedByLesson = new Set(
    progressItems.filter((p) => p.completed).map((p) => p.lesson.id)
  );

  const map = new Map<string, PathProgress>();

  for (const path of paths) {
    const allLessonIds = path.courses.flatMap((pc) =>
      pc.course.lessons?.map((l) => l.id) || []
    );
    const total = allLessonIds.length;
    const completed = allLessonIds.filter((id) => completedByLesson.has(id)).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    map.set(path.id, { totalLessons: total, completedLessons: completed, percent });
  }

  return map;
}

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningPathItem[]>([]);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [pathsRes, progressRes] = await Promise.all([
          fetch("/api/learning-paths"),
          fetch("/api/progress"),
        ]);
        const pathsData = await pathsRes.json();

        let progressData: ProgressItem[] = [];
        if (progressRes.ok) {
          const raw = await progressRes.json();
          if (handleSessionExpired(raw)) return;
          progressData = Array.isArray(raw) ? raw : [];
        } else if (progressRes.status === 401) {
          const raw = await progressRes.json().catch(() => ({}));
          if (handleSessionExpired(raw)) return;
        }

        setPaths(pathsData);
        setProgressItems(progressData);
      } catch (error) {
        console.error("Failed to fetch learning paths:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const progressMap = useMemo(() => computePathProgress(paths, progressItems), [paths, progressItems]);

  const filtered = useMemo(() => {
    return paths.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || p.difficulty === filter;
      return matchesSearch && matchesFilter;
    });
  }, [paths, search, filter]);

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
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">المسارات التعليمية</h1>
              <p className="text-[var(--muted-foreground)]">
                خطط تعليمية منظمة لتخصصات الأمن السيبراني
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="بحث في المسارات..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["all", "beginner", "intermediate", "advanced"].map((level) => (
                  <Button
                    key={level}
                    variant={filter === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(level)}
                  >
                    {level === "all" ? "الكل" : DIFF_MAP[level]}
                  </Button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-96 bg-[var(--secondary)] rounded-[var(--radius)] animate-pulse" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((path, i) => {
                  const totalCourses = path.courses.length;
                  const prog = progressMap.get(path.id);
                  const hasStarted = prog && prog.completedLessons > 0;
                  const isComplete = prog && prog.percent === 100;

                  return (
                    <motion.div
                      key={path.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                    >
                      <Card className="h-full border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 transition-all hover:shadow-lg hover:shadow-[var(--primary)]/5 cursor-pointer group overflow-hidden">
                        <Link href={`/learning-paths/${path.id}`}>
                          <div className="relative h-44 overflow-hidden">
                            {path.thumbnail ? (
                              <img
                                src={path.thumbnail}
                                alt={path.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card)] flex items-center justify-center">
                                <Compass className="h-14 w-14 text-[var(--primary)]/30" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2">
                              <Badge className={`text-xs ${DIFF_COLORS[path.difficulty] || ""}`}>
                                {DIFF_MAP[path.difficulty]}
                              </Badge>
                              {path.isFeatured && <Badge variant="success" className="text-xs">مميز</Badge>}
                            </div>
                            {hasStarted && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="h-14 w-14 rounded-full bg-[var(--primary)] flex items-center justify-center">
                                  {isComplete ? (
                                    <CheckCircle className="h-7 w-7 text-white" />
                                  ) : (
                                    <Play className="h-7 w-7 text-white mr-[-2px]" />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>

                        <CardContent className="p-5">
                          <Link href={`/learning-paths/${path.id}`}>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--primary)] transition-colors">
                              {path.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">
                            {path.description}
                          </p>

                          {/* Course thumbnails preview */}
                          {totalCourses > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                              <div className="flex -space-x-2 space-x-reverse">
                                {path.courses.slice(0, 4).map((pc) => (
                                  <div
                                    key={pc.order}
                                    className="h-8 w-8 rounded-full border-2 border-[var(--card)] overflow-hidden bg-[var(--secondary)] flex items-center justify-center"
                                  >
                                    {pc.course.thumbnail ? (
                                      <img src={pc.course.thumbnail} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <BookOpen className="h-3 w-3 text-[var(--muted-foreground)]" />
                                    )}
                                  </div>
                                ))}
                              </div>
                              {totalCourses > 4 && (
                                <span className="text-xs text-[var(--muted-foreground)]">+{totalCourses - 4}</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)] mb-3">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" /> {totalCourses} دورات
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {path.estimatedHours} ساعة
                            </span>
                          </div>

                          {/* Progress */}
                          {prog && prog.totalLessons > 0 && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[var(--muted-foreground)]">
                                  {prog.completedLessons}/{prog.totalLessons} درس
                                </span>
                                <span className="font-medium text-[var(--primary)]">{prog.percent}%</span>
                              </div>
                              <Progress value={prog.percent} className="h-1.5" />
                            </div>
                          )}

                          <Link href={`/learning-paths/${path.id}`}>
                            <Button
                              size="sm"
                              className="w-full mt-4 bg-[var(--primary)] text-[var(--primary-foreground)]"
                              variant={hasStarted ? "default" : "outline"}
                            >
                              {isComplete ? (
                                <><CheckCircle className="ml-1 h-3 w-3" /> مكتمل</>
                              ) : hasStarted ? (
                                <><Play className="ml-1 h-3 w-3" /> متابعة التعلم</>
                              ) : (
                                <><Play className="ml-1 h-3 w-3" /> ابدأ المسار</>
                              )}
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Compass className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                <p className="text-[var(--muted-foreground)]">لا توجد مسارات تعليمية حالياً.</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, CheckCircle, Play, Award, Shield, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { handleSessionExpired } from "@/lib/auth-client";

interface PathCourseItem {
  order: number;
  course: {
    id: string; title: string; description: string; thumbnail: string | null;
    difficulty: string; duration: string; category: string;
    instructorName: string;
    _count?: { lessons: number };
    lessons?: { id: string; duration: string }[];
  };
}

interface LearningPathDetail {
  id: string; title: string; description: string; descriptionLong: string;
  thumbnail: string | null; banner: string | null; difficulty: string;
  estimatedHours: number; isPublished: boolean;
  courses: PathCourseItem[];
}

interface UserProgress {
  lessonId: string; completed: boolean;
}

const DIFF_MAP: Record<string, string> = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" };
const DIFF_COLORS: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function LearningPathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [path, setPath] = useState<LearningPathDetail | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pathRes, progressRes] = await Promise.all([
          fetch(`/api/learning-paths/${params.id}`),
          fetch("/api/progress"),
        ]);
        if (!pathRes.ok) { router.push("/learning-paths"); return; }
        const pathData = await pathRes.json();

        let progressData: UserProgress[] = [];
        if (progressRes.ok) {
          const raw = await progressRes.json();
          if (handleSessionExpired(raw)) return;
          progressData = raw;
        } else if (progressRes.status === 401) {
          const raw = await progressRes.json().catch(() => ({}));
          if (handleSessionExpired(raw)) return;
        }

        setPath(pathData);
        setUserProgress(progressData);
      } catch {
        router.push("/learning-paths");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-64 bg-[var(--secondary)] rounded-xl" />
              <div className="h-8 w-48 bg-[var(--secondary)] rounded" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!path) return null;

  const allLessonIds = path.courses.flatMap((pc) => pc.course.lessons?.map((l) => l.id) || []);
  const completedLessons = allLessonIds.filter((id) => userProgress.some((p) => p.lessonId === id && p.completed)).length;
  const totalLessons = allLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const completedCourses = path.courses.filter((pc) => {
    const lessons = pc.course.lessons || [];
    if (lessons.length === 0) return false;
    return lessons.every((l) => userProgress.some((p) => p.lessonId === l.id && p.completed));
  }).length;
  const isPathComplete = progressPercent === 100 && totalLessons > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {/* Banner */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            {path.banner ? (
              <img src={path.banner} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/50 to-transparent" />
            <div className="absolute bottom-6 right-6 left-6">
              <Link href="/learning-paths" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" /> المسارات التعليمية
              </Link>
              <div className="flex items-end gap-4">
                {path.thumbnail && (
                  <img src={path.thumbnail} alt="" className="w-20 h-20 rounded-lg border-2 border-[var(--border)] object-cover hidden md:block" />
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary">{path.courses.length} دورات</Badge>
                    <Badge variant="outline"><Clock className="ml-1 h-3 w-3" />{path.estimatedHours} ساعة تقريباً</Badge>
                    <Badge className={`text-xs ${DIFF_COLORS[path.difficulty] || ""}`}>{DIFF_MAP[path.difficulty]}</Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-[var(--foreground)]">{path.title}</h1>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Progress */}
                <Card className="border-[var(--border)] bg-[var(--card)]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">تقدمك في المسار</h3>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {completedCourses}/{path.courses.length} دورات مكتملة
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">
                      {progressPercent}% مكتمل &middot; {completedLessons} من {totalLessons} درس مكتمل
                    </p>
                  </CardContent>
                </Card>

                {/* About */}
                <Card className="border-[var(--border)] bg-[var(--card)]">
                  <CardHeader>
                    <CardTitle className="text-[var(--foreground)]">عن المسار</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[var(--muted-foreground)] mb-4">{path.description}</p>
                    {path.descriptionLong && (
                      <div className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">
                        {path.descriptionLong}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card className="border-[var(--border)] bg-[var(--card)]">
                  <CardHeader>
                    <CardTitle className="text-[var(--foreground)]">
                      مسار التعلم ({path.courses.length} دورات)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-0">
                      {path.courses.map((pc, i) => {
                        const isLast = i === path.courses.length - 1;
                        const lessons = pc.course.lessons || [];
                        const isCompleted = lessons.length > 0 &&
                          lessons.every((l) => userProgress.some((p) => p.lessonId === l.id && p.completed));
                        const courseProgress = lessons.length > 0
                          ? Math.round(
                              lessons.filter((l) => userProgress.some((p) => p.lessonId === l.id && p.completed)).length
                              / lessons.length * 100
                            )
                          : 0;

                        return (
                          <div key={pc.order} className="flex gap-4">
                            {/* Timeline dot */}
                            <div className="flex flex-col items-center">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${
                                isCompleted
                                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                                  : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                              }`}>
                                {isCompleted
                                  ? <CheckCircle className="h-5 w-5" />
                                  : <span className="text-sm font-bold">{pc.order}</span>
                                }
                              </div>
                              {!isLast && <div className="w-px flex-1 bg-[var(--border)] my-1" />}
                            </div>

                            {/* Course card */}
                            <div className={`flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
                              <Link href={`/courses/${pc.course.id}`}>
                                <div className="border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--primary)]/50 transition-all cursor-pointer group">
                                  <div className="flex">
                                    {pc.course.thumbnail && (
                                      <div className="w-32 h-24 shrink-0 overflow-hidden hidden sm:block">
                                        <img src={pc.course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                      </div>
                                    )}
                                    <div className="flex-1 p-4">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary" className="text-xs">{pc.course.category}</Badge>
                                        <Badge variant="outline" className={`text-xs ${DIFF_COLORS[pc.course.difficulty] || ""}`}>
                                          {DIFF_MAP[pc.course.difficulty]}
                                        </Badge>
                                        {isCompleted && <Badge variant="success" className="text-xs">مكتمل</Badge>}
                                      </div>
                                      <h4 className="font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                                        {pc.course.title}
                                      </h4>
                                      <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-1">
                                        {pc.course.description}
                                      </p>
                                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted-foreground)]">
                                        <span>{pc.course._count?.lessons || 0} درس</span>
                                        <span>{pc.course.duration}</span>
                                        {pc.course.instructorName && (
                                          <span className="flex items-center gap-1">
                                            <Shield className="h-3 w-3" />{pc.course.instructorName}
                                          </span>
                                        )}
                                      </div>
                                      {courseProgress > 0 && (
                                        <div className="mt-2">
                                          <Progress value={courseProgress} className="h-1.5" />
                                          <span className="text-[10px] text-[var(--muted-foreground)]">{courseProgress}%</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-[var(--border)] bg-[var(--card)] sticky top-6">
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-[var(--primary)]">{progressPercent}%</p>
                      <p className="text-sm text-[var(--muted-foreground)]">مكتمل</p>
                    </div>
                    <Separator className="bg-[var(--border)]" />
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">الدورات</span>
                        <span className="text-[var(--foreground)]">{path.courses.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">الدروس</span>
                        <span className="text-[var(--foreground)]">{totalLessons}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">المدة التقريبية</span>
                        <span className="text-[var(--foreground)]">{path.estimatedHours} ساعة</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">المستوى</span>
                        <span className="text-[var(--foreground)]">{DIFF_MAP[path.difficulty]}</span>
                      </div>
                    </div>
                    <Separator className="bg-[var(--border)]" />

                    {/* Certificate — disabled */}
                    {false && (
                      <div className="flex items-center gap-2 text-[var(--success)] text-sm">
                        <Award className="h-4 w-4" /> شهادة إتمام المسار عند الانتهاء
                      </div>
                    )}

                    {/* Action Button */}
                    {isPathComplete ? (
                      <div className="space-y-2">
                        <Button className="w-full bg-[var(--success)] text-white" disabled>
                          <CheckCircle className="ml-2 h-4 w-4" /> تم إكمال المسار
                        </Button>
                        {false && (
                          <Button className="w-full" variant="outline">
                            <Download className="ml-2 h-4 w-4" /> تحميل الشهادة
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Link href={path.courses[0] ? `/courses/${path.courses[0].course.id}` : "/learning-paths"}>
                        <Button className="w-full bg-[var(--primary)] text-[var(--primary-foreground)]">
                          <Play className="ml-2 h-4 w-4" />
                          {progressPercent > 0 ? "متابعة التعلم" : "ابدأ المسار"}
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

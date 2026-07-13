"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, CheckCircle, Play, Shield, Globe, Award,
  FileText, Video, Link as LinkIcon, Code, Image, Archive,
  FolderOpen, ExternalLink, FileDown, ChevronDown, ChevronUp,
  Lock, LogIn, GraduationCap, Star, Users, LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { toast } from "sonner";
import { handleSessionExpired } from "@/lib/auth-client";

interface CourseLesson {
  id: string; title: string; contentType: string; duration: string;
  order: number; isPreview: boolean; videoUrl: string; fileUrl: string;
  externalUrl: string; codeLanguage: string;
}

interface CourseSection {
  id: string; title: string; description: string; order: number;
  lessons: CourseLesson[];
}

interface CourseDetail {
  id: string; title: string; description: string; descriptionLong: string;
  thumbnail: string | null; banner: string | null; category: string;
  difficulty: string; language: string; duration: string;
  instructorName: string; instructorBio: string; instructorAvatar: string | null;
  tags: string; isFree: boolean; averageRating: number; studentCount: number;
  xpPoints: number; certificateEnabled: boolean;
  sections: CourseSection[];
  lessons: CourseLesson[];
}

interface UserProgress {
  lessonId: string; completed: boolean;
}

const DIFF_MAP: Record<string, string> = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" };
const LANG_MAP: Record<string, string> = { ar: "العربية", en: "English" };

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  text: FileText, youtube: Play, youtube_playlist: Play, gdrive_video: Video,
  gdrive_folder: FolderOpen, vimeo: Video, external_link: ExternalLink,
  pdf: FileDown, zip: Archive, image: Image, code: Code,
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const fetchEnrollment = useCallback(async () => {
    try {
      const res = await fetch(`/api/enrollments?courseId=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        if (handleSessionExpired(data)) return;
        setEnrolled(data.enrolled);
      } else if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        if (handleSessionExpired(data)) return;
        setEnrolled(false);
      } else {
        setEnrolled(false);
      }
    } catch {
      setEnrolled(false);
    }
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [courseRes, progressRes] = await Promise.all([
          fetch(`/api/courses/${params.id}`),
          fetch("/api/progress"),
        ]);

        if (!courseRes.ok) { router.push("/courses"); return; }

        const courseData = await courseRes.json();

        let progressData: UserProgress[] = [];
        if (progressRes.ok) {
          const raw = await progressRes.json();
          if (handleSessionExpired(raw)) return;
          progressData = raw;
        } else if (progressRes.status === 401) {
          const raw = await progressRes.json().catch(() => ({}));
          if (handleSessionExpired(raw)) return;
        }

        if (cancelled) return;

        setCourse(courseData);
        setUserProgress(progressData);

        if (courseData.sections?.length > 0) {
          setExpandedSections(new Set(courseData.sections.map((s: CourseSection) => s.id)));
        }

        await fetchEnrollment();
    } catch {
      if (!cancelled) router.push("/courses");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();

    return () => { cancelled = true; };
  }, [params.id, router, fetchEnrollment]);

  const allLessons = course
    ? [...(course.sections || []).flatMap((s) => s.lessons), ...(course.lessons || [])]
    : [];

  const completedCount = allLessons.filter((l) =>
    userProgress.some((p) => p.lessonId === l.id && p.completed)
  ).length;

  const totalLessons = allLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  let tags: string[] = [];
  try { tags = JSON.parse(course?.tags || "[]"); } catch { /* ignore */ }

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: params.id }),
      });

      const data = await res.json();
      if (handleSessionExpired(data)) return;

      if (res.ok && data.enrolled) {
        setEnrolled(true);
        setEnrolling(false);
        toast.success("تم الانضمام بنجاح!", { description: "يمكنك الآن الوصول إلى جميع دروس الدورة" });

        const firstLesson = allLessons[0];
        if (firstLesson) {
          router.push(`/courses/${params.id}/lesson/${firstLesson.id}`);
        }
        return;
      }

      toast.error(data.error || "فشل الانضمام إلى الدورة");
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setEnrolling(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: params.id }),
      });

      const data = await res.json();
      if (handleSessionExpired(data)) return;

      if (res.ok && data.success) {
        setEnrolled(false);
        setUserProgress([]);
        setShowLeaveDialog(false);
        toast.success("تم مغادرة الدورة بنجاح");
      } else {
        toast.error(data.error || "فشل مغادرة الدورة");
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLeaving(false);
    }
  };

  if (loading || enrolled === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-64 bg-[var(--secondary)] rounded-xl" />
              <div className="h-8 w-48 bg-[var(--secondary)] rounded" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-[var(--secondary)] rounded-[var(--radius)]" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {/* Banner */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            {course.banner ? (
              <img src={course.banner} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/50 to-transparent" />
            <div className="absolute bottom-6 right-6 left-6">
              <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" /> العودة للدورات
              </Link>
              <div className="flex items-end gap-4">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt="" className="w-20 h-20 rounded-lg border-2 border-[var(--border)] object-cover hidden md:block" />
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary">{course.category}</Badge>
                    <Badge variant="outline">{DIFF_MAP[course.difficulty]}</Badge>
                    <Badge variant="outline"><Clock className="ml-1 h-3 w-3" />{course.duration}</Badge>
                    <Badge variant="outline"><Globe className="ml-1 h-3 w-3" />{LANG_MAP[course.language]}</Badge>
                    {course.isFree ? <Badge variant="success">مجانية</Badge> : <Badge variant="warning">مدفوعة</Badge>}
                  </div>
                  <h1 className="text-3xl font-bold text-[var(--foreground)]">{course.title}</h1>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progress (only when enrolled) */}
                {enrolled && totalLessons > 0 && (
                  <Card className="border-[var(--border)] bg-[var(--card)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">تقدمك في الدورة</h3>
                        <span className="text-sm text-[var(--muted-foreground)]">{completedCount}/{totalLessons} درس مكتمل</span>
                      </div>
                      <Progress value={progressPercent} className="h-3" />
                      <p className="text-xs text-[var(--muted-foreground)] mt-2">{progressPercent}% مكتمل</p>
                    </CardContent>
                  </Card>
                )}

                {/* About */}
                <Card className="border-[var(--border)] bg-[var(--card)]">
                  <CardHeader><CardTitle className="text-[var(--foreground)]">عن الدورة</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-[var(--muted-foreground)] mb-4">{course.description}</p>
                    {course.descriptionLong && (
                      <div className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">{course.descriptionLong}</div>
                    )}
                  </CardContent>
                </Card>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                )}

                {/* Course Content - Sections */}
                <Card className="border-[var(--border)] bg-[var(--card)]">
                  <CardHeader>
                    <CardTitle className="text-[var(--foreground)]">
                      محتوى الدورة ({course.sections?.length || 0} أقسام، {totalLessons} درس)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(course.sections || []).map((section) => {
                      const sectionCompleted = section.lessons.filter((l) =>
                        userProgress.some((p) => p.lessonId === l.id && p.completed)
                      ).length;
                      const isExpanded = expandedSections.has(section.id);

                      return (
                        <div key={section.id} className="border border-[var(--border)] rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center justify-between bg-[var(--secondary)]/50 px-4 py-3 text-right hover:bg-[var(--secondary)]/70 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-[var(--foreground)]">{section.title}</span>
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {sectionCompleted}/{section.lessons.length} درس
                              </span>
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" /> : <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />}
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="divide-y divide-[var(--border)]">
                                  {section.lessons.map((lesson) => {
                                    const Icon = ICON_MAP[lesson.contentType] || FileText;
                                    const isCompleted = userProgress.some((p) => p.lessonId === lesson.id && p.completed);
                                    const isLocked = !enrolled && !lesson.isPreview;

                                    return (
                                      <Link
                                        key={lesson.id}
                                        href={isLocked ? "#" : `/courses/${course.id}/lesson/${lesson.id}`}
                                        onClick={(e) => { if (isLocked) e.preventDefault(); }}
                                      >
                                        <div className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                                          isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--secondary)]/30 cursor-pointer"
                                        }`}>
                                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                            isCompleted ? "bg-[var(--success)]/10 text-[var(--success)]"
                                            : isLocked ? "bg-[var(--muted)]/10 text-[var(--muted-foreground)]"
                                            : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                                          }`}>
                                            {isCompleted ? <CheckCircle className="h-4 w-4" /> : isLocked ? <Lock className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                          </div>
                                          <span className="text-sm text-[var(--foreground)] flex-1">{lesson.title}</span>
                                          {lesson.duration && <span className="text-xs text-[var(--muted-foreground)]">{lesson.duration}</span>}
                                          {lesson.isPreview && <Badge variant="success" className="text-xs">معاينة</Badge>}
                                          {isLocked && <Lock className="h-3 w-3 text-[var(--muted-foreground)]" />}
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    {/* Orphan lessons (no section) */}
                    {(course.lessons || []).length > 0 && (
                      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                        <div className="bg-[var(--secondary)]/50 px-4 py-3">
                          <span className="font-medium text-[var(--foreground)]">دروس إضافية</span>
                        </div>
                        <div className="divide-y divide-[var(--border)]">
                          {course.lessons.map((lesson) => {
                            const Icon = ICON_MAP[lesson.contentType] || FileText;
                            const isCompleted = userProgress.some((p) => p.lessonId === lesson.id && p.completed);
                            const isLocked = !enrolled && !lesson.isPreview;

                            return (
                              <Link
                                key={lesson.id}
                                href={isLocked ? "#" : `/courses/${course.id}/lesson/${lesson.id}`}
                                onClick={(e) => { if (isLocked) e.preventDefault(); }}
                              >
                                <div className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                                  isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--secondary)]/30 cursor-pointer"
                                }`}>
                                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                    isCompleted ? "bg-[var(--success)]/10 text-[var(--success)]"
                                    : isLocked ? "bg-[var(--muted)]/10 text-[var(--muted-foreground)]"
                                    : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                                  }`}>
                                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : isLocked ? <Lock className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                  </div>
                                  <span className="text-sm text-[var(--foreground)] flex-1">{lesson.title}</span>
                                  {lesson.duration && <span className="text-xs text-[var(--muted-foreground)]">{lesson.duration}</span>}
                                  {isLocked && <Lock className="h-3 w-3 text-[var(--muted-foreground)]" />}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {totalLessons === 0 && (
                      <p className="text-[var(--muted-foreground)] text-center py-8">لم يتم إضافة محتوى بعد</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Enrollment Card */}
                <Card className="border-[var(--border)] bg-[var(--card)] sticky top-6">
                  <CardContent className="p-6 space-y-4">
                    {enrolled ? (
                      <div className="text-center space-y-3">
                        <div className="flex items-center justify-center gap-2 text-[var(--success)]">
                          <GraduationCap className="h-5 w-5" />
                          <span className="font-semibold">أنت مسجل في هذه الدورة</span>
                        </div>
                        {totalLessons > 0 && (
                          <>
                            <Progress value={progressPercent} className="h-2" />
                            <p className="text-xs text-[var(--muted-foreground)]">{progressPercent}% مكتمل</p>
                          </>
                        )}
                        {(() => {
                          const nextLesson = allLessons.find((l) =>
                            !userProgress.some((p) => p.lessonId === l.id && p.completed)
                          );
                          if (nextLesson) {
                            return (
                              <Link href={`/courses/${params.id}/lesson/${nextLesson.id}`} className="w-full">
                                <Button className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white">
                                  <Play className="ml-2 h-4 w-4" /> متابعة التعلم
                                </Button>
                              </Link>
                            );
                          }
                          return (
                            <Badge variant="success" className="w-full justify-center py-2 text-sm">
                              <CheckCircle className="ml-1 h-4 w-4" /> الدورة مكتملة
                            </Badge>
                          );
                        })()}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/10 w-full"
                          onClick={() => setShowLeaveDialog(true)}
                        >
                          <LogOut className="ml-1 h-3 w-3" /> مغادرة الدورة
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <p className="text-2xl font-bold text-[var(--primary)]">{course.isFree ? "مجانية" : "مدفوعة"}</p>
                        <Button
                          className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
                          onClick={handleEnroll}
                          disabled={enrolling}
                        >
                          {enrolling ? (
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full ml-2" />
                          ) : (
                            <LogIn className="ml-2 h-4 w-4" />
                          )}
                          {enrolling ? "جاري الانضمام..." : "الانضمام إلى الدورة"}
                        </Button>
                        <p className="text-xs text-[var(--muted-foreground)]">افتح جميع الدروس والمحتوى</p>
                      </div>
                    )}

                    <Separator className="bg-[var(--border)]" />

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">المدة</span>
                        <span className="text-[var(--foreground)]">{course.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">الأقسام</span>
                        <span className="text-[var(--foreground)]">{course.sections?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">الدروس</span>
                        <span className="text-[var(--foreground)]">{totalLessons}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">المستوى</span>
                        <span className="text-[var(--foreground)]">{DIFF_MAP[course.difficulty]}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">اللغة</span>
                        <span className="text-[var(--foreground)]">{LANG_MAP[course.language]}</span>
                      </div>
                      {course.averageRating > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--muted-foreground)]">التقييم</span>
                          <span className="text-[var(--foreground)] flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            {course.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">الطلاب</span>
                        <span className="text-[var(--foreground)] flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.studentCount}
                        </span>
                      </div>
                      {course.xpPoints > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--muted-foreground)]">نقاط XP</span>
                          <span className="text-[var(--foreground)]">{course.xpPoints}</span>
                        </div>
                      )}
                      {course.certificateEnabled && (
                        <div className="flex items-center gap-2 text-[var(--success)]">
                          <Award className="h-4 w-4" /> شهادة عند الإكمال
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {course.instructorName && (
                  <Card className="border-[var(--border)] bg-[var(--card)]">
                    <CardHeader><CardTitle className="text-sm text-[var(--foreground)]">المدرب</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                      {course.instructorAvatar ? (
                        <img src={course.instructorAvatar} alt="" className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[var(--secondary)] flex items-center justify-center">
                          <Shield className="h-6 w-6 text-[var(--primary)]" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{course.instructorName}</p>
                        {course.instructorBio && <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-3">{course.instructorBio}</p>}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>هل أنت متأكد من مغادرة هذه الدورة؟</DialogTitle>
            <DialogDescription>
              سيتم حذف تسجيلك في هذه الدورة وجميع تقدمك المرتبط بها (الدروس المكتملة ونتائج الاختبارات).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLeaveDialog(false)}
              disabled={leaving}
              className="border-[var(--border)]"
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={leaving}
            >
              {leaving ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full ml-2" />
              ) : null}
              {leaving ? "جاري المغادرة..." : "نعم، مغادرة الدورة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

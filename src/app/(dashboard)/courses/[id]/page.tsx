"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Clock, CheckCircle, Play, Shield, Globe, Award,
  FileText, Video, Link as LinkIcon, Code, Image, Archive,
  FolderOpen, ExternalLink, FileDown, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

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
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const [courseRes, progressRes] = await Promise.all([
          fetch(`/api/courses/${params.id}`),
          fetch("/api/progress"),
        ]);

        if (!courseRes.ok) { router.push("/courses"); return; }

        const courseData = await courseRes.json();
        const progressData = await progressRes.json();

        setCourse(courseData);
        setUserProgress(progressData);

        if (courseData.sections?.length > 0) {
          setExpandedSections(new Set(courseData.sections.map((s: CourseSection) => s.id)));
        }
      } catch (error) {
        console.error("Failed to fetch course:", error);
        router.push("/courses");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id, router]);

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
                {/* Progress */}
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
                          {isExpanded && (
                            <div className="divide-y divide-[var(--border)]">
                              {section.lessons.map((lesson) => {
                                const Icon = ICON_MAP[lesson.contentType] || FileText;
                                const isCompleted = userProgress.some((p) => p.lessonId === lesson.id && p.completed);
                                return (
                                  <Link key={lesson.id} href={`/courses/${course.id}/lesson/${lesson.id}`}>
                                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--secondary)]/30 transition-colors cursor-pointer">
                                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                        isCompleted ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                                      }`}>
                                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                      </div>
                                      <span className="text-sm text-[var(--foreground)] flex-1">{lesson.title}</span>
                                      {lesson.duration && <span className="text-xs text-[var(--muted-foreground)]">{lesson.duration}</span>}
                                      {lesson.isPreview && <Badge variant="success" className="text-xs">معاينة</Badge>}
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
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
                            return (
                              <Link key={lesson.id} href={`/courses/${course.id}/lesson/${lesson.id}`}>
                                <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--secondary)]/30 transition-colors cursor-pointer">
                                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                    isCompleted ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                                  }`}>
                                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                  </div>
                                  <span className="text-sm text-[var(--foreground)] flex-1">{lesson.title}</span>
                                  {lesson.duration && <span className="text-xs text-[var(--muted-foreground)]">{lesson.duration}</span>}
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
                <Card className="border-[var(--border)] bg-[var(--card)] sticky top-6">
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-[var(--primary)]">{course.isFree ? "مجانية" : "مدفوعة"}</p>
                    </div>
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
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle, Clock, FileText,
  ExternalLink, Download, Play, Code, Lock, LogIn,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { toast } from "sonner";
import { handleSessionExpired } from "@/lib/auth-client";

interface LessonCourse {
  id: string;
  title: string;
  sections: {
    id: string; title: string;
    lessons: { id: string; title: string; order: number; duration: string; contentType: string; isPreview: boolean }[];
  }[];
  lessons: { id: string; title: string; order: number; duration: string; contentType: string; isPreview: boolean }[];
}

interface LessonDetail {
  id: string;
  title: string;
  content: string;
  contentType: string;
  videoUrl: string;
  fileUrl: string;
  fileType: string;
  externalUrl: string;
  codeContent: string;
  codeLanguage: string;
  order: number;
  duration: string;
  courseId: string;
  course: LessonCourse;
  quiz?: { id: string; title: string; questions: { id: string }[] } | null;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractYouTubePlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function extractGDriveViewUrl(url: string): string | null {
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
  return null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

function LessonContent({ lesson }: { lesson: LessonDetail }) {
  switch (lesson.contentType) {
    case "youtube": {
      const videoId = extractYouTubeId(lesson.videoUrl);
      if (!videoId) return <div className="text-[var(--muted-foreground)] p-4">رابط YouTube غير صالح: {lesson.videoUrl}</div>;
      return (
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute inset-0 w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    case "youtube_playlist": {
      const playlistId = extractYouTubePlaylistId(lesson.videoUrl);
      if (!playlistId) return <div className="text-[var(--muted-foreground)] p-4">رابط قائمة التشغيل غير صالح</div>;
      return (
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
            className="absolute inset-0 w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    case "vimeo": {
      const vimeoId = extractVimeoId(lesson.videoUrl);
      if (!vimeoId) return <div className="text-[var(--muted-foreground)] p-4">رابط Vimeo غير صالح</div>;
      return (
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            className="absolute inset-0 w-full h-full rounded-lg"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    case "gdrive_video": {
      const embedUrl = extractGDriveViewUrl(lesson.videoUrl);
      if (!embedUrl) return <div className="text-[var(--muted-foreground)] p-4">رابط Google Drive غير صالح: {lesson.videoUrl}</div>;
      return (
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe src={embedUrl} className="absolute inset-0 w-full h-full rounded-lg" allow="autoplay" />
        </div>
      );
    }
    case "gdrive_folder": {
      const folderId = lesson.videoUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/)?.[1];
      if (!folderId) return <div className="text-[var(--muted-foreground)] p-4">رابط المجلد غير صالح</div>;
      return (
        <div className="relative w-full" style={{ paddingBottom: "75%" }}>
          <iframe
            src={`https://drive.google.com/embeddedfolderview?id=${folderId}#list`}
            className="absolute inset-0 w-full h-full rounded-lg border border-[var(--border)]"
          />
        </div>
      );
    }
    case "pdf":
      if (lesson.fileUrl) {
        return (
          <div className="relative w-full" style={{ paddingBottom: "100%" }}>
            <iframe src={lesson.fileUrl} className="absolute inset-0 w-full h-full rounded-lg" />
          </div>
        );
      }
      return <div className="text-[var(--muted-foreground)] p-4">ملف PDF غير متوفر</div>;
    case "image":
      if (lesson.fileUrl) {
        return (
          <div className="flex justify-center">
            <img src={lesson.fileUrl} alt={lesson.title} className="max-w-full rounded-lg border border-[var(--border)]" />
          </div>
        );
      }
      return <div className="text-[var(--muted-foreground)] p-4">صورة غير متوفرة</div>;
    case "zip":
      if (lesson.fileUrl) {
        return (
          <a href={lesson.fileUrl} download target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-[var(--border)] gap-2">
              <Download className="h-4 w-4" /> تحميل الملف
            </Button>
          </a>
        );
      }
      return <div className="text-[var(--muted-foreground)] p-4">ملف غير متوفر</div>;
    case "external_link":
      if (lesson.externalUrl) {
        return (
          <a href={lesson.externalUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-[var(--border)] gap-2">
              <ExternalLink className="h-4 w-4" /> فتح الرابط الخارجي
            </Button>
          </a>
        );
      }
      return <div className="text-[var(--muted-foreground)] p-4">رابط غير متوفر</div>;
    case "code":
      return (
        <div className="relative">
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs"><Code className="h-3 w-3 ml-1" />{lesson.codeLanguage}</Badge>
          </div>
          <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 pt-10 overflow-x-auto text-sm font-mono text-[var(--foreground)] whitespace-pre-wrap">
            <code>{lesson.codeContent}</code>
          </pre>
        </div>
      );
    case "text":
    default:
      if (!lesson.content) return <div className="text-[var(--muted-foreground)] p-4">لا يوجد محتوى</div>;
      return (
        <div className="prose prose-invert max-w-none">
          {lesson.content.split("\n").map((paragraph, i) => {
            if (paragraph.startsWith("- ")) {
              return <li key={i} className="text-[var(--foreground)] ml-4 mb-1">{paragraph.slice(2)}</li>;
            }
            if (paragraph.trim() === "") return <br key={i} />;
            return <p key={i} className="text-[var(--foreground)] mb-3 leading-relaxed">{paragraph}</p>;
          })}
        </div>
      );
  }
}

function getFlatLessons(course: LessonCourse) {
  const lessons: { id: string; title: string; order: number; duration: string; contentType: string }[] = [];
  for (const section of course.sections || []) {
    for (const l of section.lessons) lessons.push(l);
  }
  for (const l of course.lessons || []) lessons.push(l);
  return lessons;
}

type LessonState = "loading" | "not_enrolled" | "error" | "ready";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [completed, setCompleted] = useState(false);
  const [state, setState] = useState<LessonState>("loading");
  const [marking, setMarking] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLesson = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}/lessons/${params.lessonId}`);

      if (res.status === 403) {
        setState("not_enrolled");
        return;
      }

      if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        if (handleSessionExpired(data)) return;
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Unknown error" }));
        setErrorMsg(errData.error || "حدث خطأ في تحميل الدرس");
        setState("error");
        return;
      }

      const data = await res.json();
      setLesson(data.lesson);
      setCompleted(data.completed);
      setState("ready");
    } catch {
      setErrorMsg("حدث خطأ في الاتصال بالخادم");
      setState("error");
    }
  }, [params.id, params.lessonId, router]);

  useEffect(() => { fetchLesson(); }, [fetchLesson]);

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
        toast.success("تم الانضمام بنجاح!");
        await fetchLesson();
      } else {
        toast.error(data.error || "فشل الانضمام إلى الدورة");
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!lesson) return;
    setMarking(true);
    try {
      const newCompleted = !completed;
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, completed: newCompleted }),
      });
      if (res.ok) {
        setCompleted(newCompleted);
      } else if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        handleSessionExpired(data);
      }
    } catch {
      // ignore
    } finally {
      setMarking(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
              <div className="h-8 w-48 bg-[var(--secondary)] rounded" />
              <div className="h-96 bg-[var(--secondary)] rounded-[var(--radius)]" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center py-20"
            >
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">خطأ</h1>
              <p className="text-[var(--muted-foreground)] mb-8">{errorMsg}</p>
              <Button variant="outline" className="border-[var(--border)]" onClick={() => router.push(`/courses/${params.id}`)}>
                العودة للدورة
              </Button>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  if (state === "not_enrolled") {
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
              className="max-w-2xl mx-auto text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--muted)]/10 flex items-center justify-center">
                <Lock className="h-10 w-10 text-[var(--muted-foreground)]" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">محتوى مقفل</h1>
              <p className="text-[var(--muted-foreground)] mb-8 max-w-md mx-auto">
                يجب عليك التسجيل في هذه الدورة أولًا للوصول إلى هذا المحتوى
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full ml-2" />
                  ) : (
                    <LogIn className="ml-2 h-4 w-4" />
                  )}
                  {enrolling ? "جاري الانضمام..." : "الانضمام إلى الدورة"}
                </Button>
                <Link href={`/courses/${params.id}`}>
                  <Button variant="outline" className="border-[var(--border)]">العودة للدورة</Button>
                </Link>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  const allLessons = getFlatLessons(lesson.course);
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

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
            className="max-w-4xl mx-auto"
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-6">
              <Link href="/courses" className="hover:text-[var(--foreground)]">الدورات</Link>
              <span>/</span>
              <Link href={`/courses/${lesson.courseId}`} className="hover:text-[var(--foreground)]">{lesson.course.title}</Link>
              <span>/</span>
              <span className="text-[var(--foreground)]">{lesson.title}</span>
            </div>

            {/* Lesson Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">الدرس {currentIndex + 1} من {allLessons.length}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />{lesson.duration}
                </Badge>
                <Badge variant="outline">{lesson.contentType === "text" ? "نص" : lesson.contentType === "youtube" ? "فيديو YouTube" : lesson.contentType === "code" ? "كود" : lesson.contentType}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
            </div>

            {/* Content */}
            <Card className="mb-8 border-[var(--border)] bg-[var(--card)]">
              <CardContent className="p-8">
                <LessonContent lesson={lesson} />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                onClick={handleToggleComplete}
                disabled={marking}
                variant={completed ? "outline" : "default"}
                className="flex items-center gap-2"
              >
                {marking ? (
                  "جارٍ التسجيل..."
                ) : completed ? (
                  <><CheckCircle className="h-4 w-4 text-[var(--success)]" /> مكتمل — اضغط لإلغاء الإكمال</>
                ) : (
                  <><CheckCircle className="h-4 w-4" /> تحديد كمكتمل</>
                )}
              </Button>

              {lesson.quiz && (
                <Link href={`/courses/${lesson.courseId}/lesson/${lesson.id}/quiz`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> اختبار ({lesson.quiz.questions.length} سؤال)
                  </Button>
                </Link>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
              {prevLesson ? (
                <Link href={`/courses/${lesson.courseId}/lesson/${prevLesson.id}`}>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <div className="text-left">
                      <p className="text-xs text-[var(--muted-foreground)]">السابق</p>
                      <p className="text-sm font-medium">{prevLesson.title}</p>
                    </div>
                  </Button>
                </Link>
              ) : <div />}

              {nextLesson ? (
                <Link href={`/courses/${lesson.courseId}/lesson/${nextLesson.id}`}>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-[var(--muted-foreground)]">التالي</p>
                      <p className="text-sm font-medium">{nextLesson.title}</p>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/courses/${lesson.courseId}`}>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-[var(--muted-foreground)]">إنهاء</p>
                      <p className="text-sm font-medium">العودة للدورة</p>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

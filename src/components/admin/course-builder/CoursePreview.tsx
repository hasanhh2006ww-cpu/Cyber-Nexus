"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Clock, BookOpen, Play, FileText, Video, Link, Code, Image, Archive, FolderOpen, ExternalLink, FileDown, Globe, Award } from "lucide-react"
import { CONTENT_TYPES } from "@/types"

interface PreviewProps {
  course: {
    title: string; description: string; descriptionLong: string;
    thumbnail?: string | null; banner?: string | null; category: string;
    difficulty: string; language: string; duration: string;
    instructorName: string; instructorBio: string; instructorAvatar?: string | null;
    tags: string[]; isFree: boolean;
  }
  sections: Array<{
    title: string; lessons: Array<{
      title: string; contentType: string; duration: string; isPreview: boolean;
    }>;
  }>
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  text: FileText, youtube: Play, youtube_playlist: Play, gdrive_video: Video,
  gdrive_folder: FolderOpen, vimeo: Video, external_link: ExternalLink,
  pdf: FileDown, zip: Archive, image: Image, code: Code,
}

const DIFF_MAP: Record<string, string> = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" }
const LANG_MAP: Record<string, string> = { ar: "العربية", en: "English" }

export function CoursePreview({ course, sections }: PreviewProps) {
  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Banner */}
        <div className="relative h-64 md:h-80 overflow-hidden rounded-xl mb-8">
          {course.banner ? (
            <img src={course.banner} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-transparent" />
          <div className="absolute bottom-6 right-6 left-6">
            {course.thumbnail && (
              <img src={course.thumbnail} alt="" className="w-20 h-20 rounded-lg border-2 border-[var(--border)] object-cover mb-3" />
            )}
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">{course.title || "عنوان الدورة"}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{course.category || "التصنيف"}</Badge>
              <Badge variant="outline">{DIFF_MAP[course.difficulty] || course.difficulty}</Badge>
              <Badge variant="outline"><Clock className="ml-1 h-3 w-3" />{course.duration || "المدة"}</Badge>
              <Badge variant="outline"><Globe className="ml-1 h-3 w-3" />{LANG_MAP[course.language] || course.language}</Badge>
              {course.isFree ? <Badge variant="success">مجانية</Badge> : <Badge variant="warning">مدفوعة</Badge>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader><CardTitle className="text-[var(--foreground)]">عن الدورة</CardTitle></CardHeader>
              <CardContent>
                <p className="text-[var(--muted-foreground)] mb-4">{course.description || "وصف مختصر للدورة..."}</p>
                {course.descriptionLong && (
                  <div className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">
                    {course.descriptionLong}
                  </div>
                )}
              </CardContent>
            </Card>

            {course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
            )}

            {/* Course Content */}
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)]">
                  محتوى الدورة ({sections.length} أقسام، {totalLessons} درس)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sections.length === 0 ? (
                  <p className="text-[var(--muted-foreground)] text-center py-8">لم يتم إضافة محتوى بعد</p>
                ) : sections.map((section, si) => (
                  <div key={si} className="border border-[var(--border)] rounded-lg overflow-hidden">
                    <div className="bg-[var(--secondary)]/50 px-4 py-3">
                      <h4 className="font-medium text-[var(--foreground)]">القسم {si + 1}: {section.title}</h4>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                      {section.lessons.map((lesson, li) => {
                        const Icon = ICON_MAP[lesson.contentType] || FileText
                        return (
                          <div key={li} className="flex items-center gap-3 px-4 py-3">
                            <Icon className="h-4 w-4 text-[var(--primary)] shrink-0" />
                            <span className="text-sm text-[var(--foreground)] flex-1">{lesson.title}</span>
                            {lesson.duration && <span className="text-xs text-[var(--muted-foreground)]">{lesson.duration}</span>}
                            {lesson.isPreview && <Badge variant="success" className="text-xs">معاينة</Badge>}
                            {!lesson.isPreview && <Play className="h-3 w-3 text-[var(--muted-foreground)]" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
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
                    <span className="text-[var(--foreground)]">{course.duration || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted-foreground)]">الأقسام</span>
                    <span className="text-[var(--foreground)]">{sections.length}</span>
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
                    {course.instructorBio && <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">{course.instructorBio}</p>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

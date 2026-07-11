"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import { toast } from "@/components/ui/sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseInfoForm, type CourseFormData } from "@/components/admin/course-builder/CourseInfoForm"
import { CourseContentBuilder } from "@/components/admin/course-builder/CourseContentBuilder"
import { CoursePreview } from "@/components/admin/course-builder/CoursePreview"

interface SectionData {
  id: string; title: string; description: string; order: number;
  lessons: Array<{
    id: string; title: string; content: string; contentType: string; videoUrl: string;
    fileUrl: string; fileType: string; externalUrl: string; codeContent: string;
    codeLanguage: string; order: number; duration: string; isPreview: boolean;
    sectionId?: string | null;
  }>;
}

interface LessonData {
  id: string; title: string; content: string; contentType: string; videoUrl: string;
  fileUrl: string; fileType: string; externalUrl: string; codeContent: string;
  codeLanguage: string; order: number; duration: string; isPreview: boolean;
  sectionId?: string | null;
}

const defaultCourse: CourseFormData = {
  title: "", description: "", descriptionLong: "", category: "",
  difficulty: "beginner", language: "ar", duration: "",
  instructorName: "", instructorBio: "", instructorAvatar: "",
  thumbnail: "", banner: "", tags: [],
  isFree: true, isPublished: false, isFeatured: false, sortOrder: 0,
  commentsEnabled: true, reviewsEnabled: true, xpPoints: 0, certificateEnabled: false,
}

export default function AdminCourseBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<CourseFormData>(defaultCourse)
  const [sections, setSections] = useState<SectionData[]>([])
  const [orphanLessons, setOrphanLessons] = useState<LessonData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [showPreview, setShowPreview] = useState(false)

  const isNew = courseId === "new"

  const fetchCourse = useCallback(async () => {
    if (isNew) { setLoading(false); return }
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`)
      if (!res.ok) { router.push("/admin/courses"); return }
      const data = await res.json()

      let parsedTags: string[] = []
      try { parsedTags = JSON.parse(data.tags || "[]") } catch { parsedTags = [] }

      setCourse({
        title: data.title || "", description: data.description || "",
        descriptionLong: data.descriptionLong || "", category: data.category || "",
        difficulty: data.difficulty || "beginner", language: data.language || "ar",
        duration: data.duration || "", instructorName: data.instructorName || "",
        instructorBio: data.instructorBio || "", instructorAvatar: data.instructorAvatar || "",
        thumbnail: data.thumbnail || "", banner: data.banner || "", tags: parsedTags,
        isFree: data.isFree ?? true, isPublished: data.isPublished ?? false,
        isFeatured: data.isFeatured ?? false, sortOrder: data.sortOrder || 0,
        commentsEnabled: data.commentsEnabled ?? true, reviewsEnabled: data.reviewsEnabled ?? true,
        xpPoints: data.xpPoints || 0, certificateEnabled: data.certificateEnabled ?? false,
      })

      setSections((data.sections || []).map((s: SectionData) => ({
        ...s,
        lessons: (s.lessons || []).map((l: LessonData) => ({ ...l })),
      })))

      setOrphanLessons(data.lessons || [])
    } catch (err) {
      console.error(err)
      toast.error("Failed to load course")
    } finally {
      setLoading(false)
    }
  }, [courseId, isNew, router])

  useEffect(() => { fetchCourse() }, [fetchCourse])

  const handleSave = async () => {
    if (!course.title || !course.description || !course.category || !course.duration) {
      toast.error("يرجى ملء جميع الحقول المطلوبة")
      setActiveTab("info")
      return
    }

    setSaving(true)
    try {
      const method = isNew ? "POST" : "PUT"
      const url = isNew ? "/api/admin/courses" : `/api/admin/courses/${courseId}`
      const body = { ...course }

      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to save course")
      const saved = await res.json()

      toast.success(isNew ? "تم إنشاء الدورة بنجاح" : "تم حفظ التغييرات")
      if (isNew) {
        router.push(`/admin/courses/${saved.id}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    const newState = !course.isPublished
    setCourse((prev) => ({ ...prev, isPublished: newState }))
    if (!isNew) {
      try {
        await fetch(`/api/admin/courses/${courseId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: newState }),
        })
        toast.success(newState ? "تم نشر الدورة" : "تم إخفاء الدورة")
      } catch {
        setCourse((prev) => ({ ...prev, isPublished: !newState }))
        toast.error("Failed to toggle publish")
      }
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-[var(--secondary)] rounded" />
          <div className="h-12 bg-[var(--secondary)] rounded" />
          <div className="h-64 bg-[var(--secondary)] rounded-[var(--radius)]" />
        </div>
      </div>
    )
  }

  if (showPreview) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="ml-2 h-4 w-4" /> العودة للتعديل
          </Button>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">معاينة الدورة</h1>
        </div>
        <CoursePreview course={course} sections={sections} />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/courses" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <ArrowLeft className="h-4 w-4 inline ml-1" /> الدورات
            </Link>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {isNew ? "دورة جديدة" : "تعديل الدورة"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-[var(--border)]" onClick={() => setShowPreview(true)}>
              <Eye className="ml-2 h-4 w-4" /> معاينة
            </Button>
            {!isNew && (
              <Button variant="outline" className="border-[var(--border)]" onClick={handleTogglePublish}>
                {course.isPublished ? <><EyeOff className="ml-2 h-4 w-4" /> إخفاء</> : <><Eye className="ml-2 h-4 w-4" /> نشر</>}
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving} className="bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Save className="ml-2 h-4 w-4" /> {saving ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="info">معلومات الدورة</TabsTrigger>
            <TabsTrigger value="content">محتوى الدورة</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <CourseInfoForm course={course} onChange={(data) => setCourse((prev) => ({ ...prev, ...data }))} />
          </TabsContent>

          <TabsContent value="content">
            {isNew ? (
              <Card className="border-[var(--border)] bg-[var(--card)]">
                <CardContent className="py-12 text-center">
                  <p className="text-[var(--muted-foreground)]">احفظ الدورة أولاً ثم أضف المحتوى</p>
                </CardContent>
              </Card>
            ) : (
              <CourseContentBuilder courseId={courseId} sections={sections} orphanLessons={orphanLessons} onUpdate={fetchCourse} />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

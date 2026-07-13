"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Save, Trash2, Plus, GripVertical, Search, BookOpen } from "lucide-react"
import { toast } from "@/components/ui/sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog"

interface Course {
  id: string; title: string; category: string; difficulty: string; isPublished: boolean;
}

interface PathCourse {
  id: string; courseId: string; order: number;
  course: Course;
}

interface LearningPathData {
  id: string; title: string; slug: string; description: string; descriptionLong: string;
  thumbnail: string; banner: string; difficulty: string; estimatedHours: number;
  isPublished: boolean; isFeatured: boolean; sortOrder: number;
  courses: PathCourse[];
}

export default function AdminLearningPathEditPage() {
  const router = useRouter()
  const params = useParams()
  const pathId = params.id as string
  const isNew = pathId === "new"

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [pathData, setPathData] = useState<LearningPathData | null>(isNew ? null : null)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    descriptionLong: "",
    thumbnail: "",
    banner: "",
    difficulty: "beginner",
    estimatedHours: 10,
    isPublished: false,
    isFeatured: false,
    sortOrder: 0,
  })
  const [pathCourses, setPathCourses] = useState<PathCourse[]>([])
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false)
  const [courseSearch, setCourseSearch] = useState("")
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [removingCourse, setRemovingCourse] = useState<PathCourse | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const coursesRes = await fetch("/api/admin/courses")
        if (coursesRes.ok) {
          const data = await coursesRes.json()
          setAllCourses(data.courses ?? data)
        }
        if (!isNew) {
          const pathRes = await fetch(`/api/admin/learning-paths/${pathId}`)
          if (pathRes.ok) {
            const data = await pathRes.json()
            setPathData(data)
            setForm({
              title: data.title, slug: data.slug, description: data.description,
              descriptionLong: data.descriptionLong || "", thumbnail: data.thumbnail || "",
              banner: data.banner || "", difficulty: data.difficulty,
              estimatedHours: data.estimatedHours, isPublished: data.isPublished,
              isFeatured: data.isFeatured, sortOrder: data.sortOrder || 0,
            })
            setPathCourses(data.courses || [])
          }
        }
      } catch { /* silent */ }
      setLoading(false)
    }
    load()
  }, [pathId, isNew])

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()

  const handleTitleChange = (val: string) => {
    setForm((f) => ({ ...f, title: val, slug: isNew ? autoSlug(val) : f.slug }))
  }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("العنوان مطلوب"); return }
    if (!form.slug.trim()) { toast.error("ال Slug مطلوب"); return }

    setSaving(true)
    try {
      const method = isNew ? "POST" : "PUT"
      const url = isNew ? "/api/admin/learning-paths" : `/api/admin/learning-paths/${pathId}`
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || "Failed to save")
      }
      const saved = await res.json()
      toast.success(isNew ? "تم إنشاء المسار التعليمي" : "تم حفظ التغييرات")
      if (isNew) router.push(`/admin/learning-paths/${saved.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleAddCourse = async (courseId: string) => {
    const order = pathCourses.length + 1
    try {
      const res = await fetch("/api/admin/learning-paths/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learningPathId: pathId, courseId, order }),
      })
      if (!res.ok) throw new Error("Failed")
      const added = await res.json()
      const course = allCourses.find((c) => c.id === courseId)
      setPathCourses((prev) => [...prev, { id: added.id, courseId, order, course: course! }])
      setAddCourseDialogOpen(false)
      toast.success("تمت إضافة الدورة")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add course")
    }
  }

  const handleRemoveCourse = async () => {
    if (!removingCourse) return
    try {
      const res = await fetch(`/api/admin/learning-paths/courses`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learningPathId: pathId, courseId: removingCourse.courseId }),
      })
      if (!res.ok) throw new Error("Failed")
      setPathCourses((prev) => prev.filter((c) => c.id !== removingCourse.id))
      setRemoveDialogOpen(false)
      setRemovingCourse(null)
      toast.success("تمت إزالة الدورة")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove course")
    }
  }

  const handleReorder = async (courseId: string, direction: "up" | "down") => {
    const idx = pathCourses.findIndex((c) => c.courseId === courseId)
    if (idx === -1) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= pathCourses.length) return

    const reordered = [...pathCourses]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
    const withOrders = reordered.map((c, i) => ({ ...c, order: i + 1 }))
    setPathCourses(withOrders)

    try {
      await fetch("/api/admin/learning-paths/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learningPathId: pathId,
          courses: withOrders.map((c) => ({ courseId: c.courseId, order: c.order })),
        }),
      })
    } catch { /* silent */ }
  }

  const availableCourses = allCourses.filter(
    (c) => c.isPublished && !pathCourses.some((pc) => pc.courseId === c.id)
      && c.title.toLowerCase().includes(courseSearch.toLowerCase())
  )

  const diffLabel: Record<string, string> = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-[var(--secondary)]" />
          <div className="h-64 animate-pulse rounded bg-[var(--secondary)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/admin/learning-paths" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors">
          <ArrowRight className="h-4 w-4" /> العودة للمسارات
        </Link>

        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
          {isNew ? "إنشاء مسار تعليمي جديد" : `تعديل: ${form.title}`}
        </h1>

        <div className="space-y-6">
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader><CardTitle className="text-[var(--foreground)]">المعلومات الأساسية</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[var(--foreground)]">العنوان *</Label>
                  <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="مثال: أساسيات الأمن السيبراني" className="mt-1" />
                </div>
                <div>
                  <Label className="text-[var(--foreground)]">ال Slug *</Label>
                  <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="cybersecurity-fundamentals" className="mt-1 font-mono" />
                </div>
              </div>
              <div>
                <Label className="text-[var(--foreground)]">الوصف المختصر</Label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-[var(--foreground)]">الوصف التفصيلي</Label>
                <Textarea value={form.descriptionLong} onChange={(e) => setForm((f) => ({ ...f, descriptionLong: e.target.value }))} rows={4} className="mt-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[var(--foreground)]">المستوى</Label>
                  <Select value={form.difficulty} onValueChange={(val) => setForm((f) => ({ ...f, difficulty: val }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">مبتدئ</SelectItem>
                      <SelectItem value="intermediate">متوسط</SelectItem>
                      <SelectItem value="advanced">متقدم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[var(--foreground)]">المدة (ساعات)</Label>
                  <Input type="number" value={form.estimatedHours} onChange={(e) => setForm((f) => ({ ...f, estimatedHours: parseInt(e.target.value) || 0 }))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-[var(--foreground)]">الترتيب</Label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[var(--foreground)]">رابط الصورة المصغرة</Label>
                  <Input value={form.thumbnail} onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-[var(--foreground)]">رابط البانر</Label>
                  <Input value={form.banner} onChange={(e) => setForm((f) => ({ ...f, banner: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.isPublished} onCheckedChange={(val) => setForm((f) => ({ ...f, isPublished: val }))} />
                  <Label className="text-[var(--foreground)]">منشور</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.isFeatured} onCheckedChange={(val) => setForm((f) => ({ ...f, isFeatured: val }))} />
                  <Label className="text-[var(--foreground)]">مميز</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[var(--foreground)]">الدورات ({pathCourses.length})</CardTitle>
              {!isNew && (
                <Button size="sm" onClick={() => setAddCourseDialogOpen(true)} className="bg-[var(--primary)] text-[var(--primary-foreground)]">
                  <Plus className="ml-1 h-4 w-4" /> إضافة دورة
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {pathCourses.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                  {isNew ? "احفظ المسار أولاً ثم أضف الدورات" : "لا توجد دورات في هذا المسار. اضغط \"إضافة دورة\" لبدء البناء."}
                </p>
              ) : (
                <div className="space-y-2">
                  {pathCourses.map((pc, i) => (
                    <div key={pc.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                      <div className="flex flex-col gap-0.5">
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" disabled={i === 0} onClick={() => handleReorder(pc.courseId, "up")}>
                          <GripVertical className="h-3 w-3 rotate-180" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" disabled={i === pathCourses.length - 1} onClick={() => handleReorder(pc.courseId, "down")}>
                          <GripVertical className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="h-6 w-6 rounded-full bg-[var(--secondary)] flex items-center justify-center text-xs font-bold text-[var(--foreground)]">{pc.order}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">{pc.course.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{pc.course.category} &middot; {diffLabel[pc.course.difficulty] || pc.course.difficulty}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setRemovingCourse(pc); setRemoveDialogOpen(true) }}>
                        <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/admin/learning-paths">
              <Button variant="outline" className="border-[var(--border)]">إلغاء</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving} className="bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Save className="ml-2 h-4 w-4" />
              {saving ? "جاري الحفظ..." : isNew ? "إنشاء المسار" : "حفظ التغييرات"}
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog open={addCourseDialogOpen} onOpenChange={setAddCourseDialogOpen}>
        <DialogContent className="border-[var(--border)] bg-[var(--card)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)]">إضافة دورة للمسار</DialogTitle>
          </DialogHeader>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input placeholder="بحث عن دورة..." value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="max-h-80 overflow-y-auto space-y-1">
            {availableCourses.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-4">لا توجد دورات متاحة.</p>
            ) : (
              availableCourses.map((course) => (
                <button key={course.id} onClick={() => handleAddCourse(course.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--accent)] text-right transition-colors">
                  <BookOpen className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{course.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{course.category} &middot; {diffLabel[course.difficulty] || course.difficulty}</p>
                  </div>
                  <Plus className="h-4 w-4 text-[var(--primary)] shrink-0" />
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="border-[var(--border)] bg-[var(--card)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)]">إزالة الدورة</DialogTitle>
            <DialogDescription className="text-[var(--muted-foreground)]">
              هل أنت متأكد من إزالة &quot;{removingCourse?.course.title}&quot; من هذا المسار؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-[var(--border)]">إلغاء</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleRemoveCourse}>إزالة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

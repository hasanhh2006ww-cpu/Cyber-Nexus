"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

interface Lesson {
  id: string
  title: string
  content: string
  order: number
  duration: string
  quiz?: { id: string } | null
}

interface Course {
  id: string
  title: string
  lessons: Lesson[]
}

const emptyForm = {
  title: "",
  content: "",
  order: 1,
  duration: "",
}

export default function AdminLessonsPage() {
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/courses/${courseId}`)
        if (!res.ok) throw new Error("Failed to fetch course")
        const data = await res.json()
        setCourse(data.course ?? data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`)
      if (!res.ok) throw new Error("Failed to fetch course")
      const data = await res.json()
      setCourse(data.course ?? data)
    } catch {
      // silent refresh failure
    }
  }

  const sortedLessons = [...(course?.lessons ?? [])].sort(
    (a, b) => a.order - b.order
  )

  const openCreate = () => {
    setEditingLesson(null)
    setForm({ ...emptyForm, order: sortedLessons.length + 1 })
    setDialogOpen(true)
  }

  const openEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setForm({
      title: lesson.title,
      content: lesson.content,
      order: lesson.order,
      duration: lesson.duration,
    })
    setDialogOpen(true)
  }

  const openDelete = (lesson: Lesson) => {
    setDeletingLesson(lesson)
    setDeleteDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = editingLesson ? "PUT" : "POST"
      const url = editingLesson
        ? `/api/admin/lessons/${editingLesson.id}`
        : `/api/admin/lessons`
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          order: Number(form.order),
          courseId,
        }),
      })
      if (!res.ok) throw new Error("Failed to save lesson")
      toast.success(
        editingLesson ? "Lesson updated successfully" : "Lesson created successfully"
      )
      setDialogOpen(false)
      fetchCourse()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save lesson")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingLesson) return
    try {
      const res = await fetch(
        `/api/admin/lessons/${deletingLesson.id}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Failed to delete lesson")
      toast.success("Lesson deleted successfully")
      setDeleteDialogOpen(false)
      setDeletingLesson(null)
      fetchCourse()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete lesson")
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-[var(--secondary)]" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded bg-[var(--secondary)]"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-[var(--destructive)]">
              {error ?? "Course not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          href="/admin/courses"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للدورات
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            الدروس — {course.title}
          </h1>
          <Button onClick={openCreate} className="bg-[var(--primary)] text-[var(--primary-foreground)]">
            <Plus className="mr-2 h-4 w-4" />
            إضافة درس
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardContent className="p-0">
            {sortedLessons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-[var(--muted-foreground)]">
                  لا توجد دروس بعد. أضف درسك الأول للبدء.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--border)]">
                    <TableHead className="w-16 text-[var(--muted-foreground)]">
                      الترتيب
                    </TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">
                      العنوان
                    </TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">
                      المدة
                    </TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">
                      يحتوي على اختبار
                    </TableHead>
                    <TableHead className="text-right text-[var(--muted-foreground)]">
                      الإجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLessons.map((lesson) => (
                    <TableRow
                      key={lesson.id}
                      className="border-[var(--border)]"
                    >
                      <TableCell className="text-[var(--foreground)]">
                        {lesson.order}
                      </TableCell>
                      <TableCell className="font-medium text-[var(--foreground)]">
                        {lesson.title}
                      </TableCell>
                      <TableCell className="text-[var(--foreground)]">
                        {lesson.duration}
                      </TableCell>
                      <TableCell>
                        {lesson.quiz ? (
                          <Badge variant="success">نعم</Badge>
                        ) : (
                          <Badge variant="secondary">لا</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(lesson)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDelete(lesson)}
                          >
                            <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-[var(--border)] bg-[var(--card)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)]">
              {editingLesson ? "تعديل الدرس" : "إضافة درس"}
            </DialogTitle>
            <DialogDescription className="text-[var(--muted-foreground)]">
              {editingLesson
                ? "حدّث بيانات الدرس أدناه."
                : "أدخل البيانات لإنشاء درس جديد."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">العنوان</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">المحتوى</Label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                rows={6}
                className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">الترتيب</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: parseInt(e.target.value) || 1 })
                  }
                  className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">المدة</Label>
                <Input
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  placeholder="e.g. 30 min"
                  className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-[var(--border)] text-[var(--foreground)]">
                إلغاء
              </Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={saving || !form.title}
              className="bg-[var(--primary)] text-[var(--primary-foreground)]"
            >
              {saving ? "جارٍ الحفظ..." : editingLesson ? "تحديث" : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-[var(--border)] bg-[var(--card)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)]">
              حذف الدرس
            </DialogTitle>
            <DialogDescription className="text-[var(--muted-foreground)]">
              هل أنت متأكد من حذف &quot;{deletingLesson?.title}&quot;?
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-[var(--border)] text-[var(--foreground)]">
                إلغاء
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

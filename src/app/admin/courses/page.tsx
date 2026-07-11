"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Pencil, Trash2, Search, Eye, EyeOff } from "lucide-react"
import { toast } from "@/components/ui/sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog"

interface Course {
  id: string; title: string; description: string; category: string;
  difficulty: string; duration: string; isPublished: boolean; isFeatured: boolean;
  _count?: { lessons: number; sections: number; reviews: number };
}

const difficultyVariant: Record<string, "success" | "warning" | "destructive"> = {
  beginner: "success", intermediate: "warning", advanced: "destructive",
}

export default function AdminCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/courses")
        if (!res.ok) throw new Error("Failed to fetch courses")
        const data = await res.json()
        setCourses(data.courses ?? data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses")
      if (!res.ok) throw new Error("Failed to fetch courses")
      const data = await res.json()
      setCourses(data.courses ?? data)
    } catch { /* silent */ }
  }

  const filtered = useMemo(
    () => courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase())),
    [courses, search]
  )

  const handleDelete = async () => {
    if (!deletingCourse) return
    try {
      const res = await fetch(`/api/admin/courses/${deletingCourse.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete course")
      toast.success("تم حذف الدورة")
      setDeleteDialogOpen(false)
      setDeletingCourse(null)
      fetchCourses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const handleTogglePublish = async (course: Course) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      })
      if (!res.ok) throw new Error("Failed")
      setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, isPublished: !c.isPublished } : c))
      toast.success(course.isPublished ? "تم إخفاء الدورة" : "تم نشر الدورة")
    } catch {
      toast.error("Failed to toggle publish")
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-[var(--secondary)]" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded bg-[var(--secondary)]" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-[var(--destructive)]">{error}</p>
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
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <h1 className="text-2xl font-bold text-[var(--foreground)]">الدورات</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              placeholder="بحث في الدورات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 border-[var(--border)] bg-[var(--card)] pl-9 text-[var(--foreground)]"
            />
          </div>
          <Link href="/admin/courses/new">
            <Button className="bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Plus className="ml-2 h-4 w-4" /> إضافة دورة
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-[var(--muted-foreground)]">لا توجد دورات.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--border)]">
                    <TableHead className="text-[var(--muted-foreground)]">العنوان</TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">التصنيف</TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">المستوى</TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">الحالة</TableHead>
                    <TableHead className="text-right text-[var(--muted-foreground)]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((course) => (
                    <TableRow key={course.id} className="border-[var(--border)]">
                      <TableCell className="font-medium text-[var(--foreground)]">
                        {course.title}
                      </TableCell>
                      <TableCell className="text-[var(--foreground)]">{course.category}</TableCell>
                      <TableCell>
                        <Badge variant={difficultyVariant[course.difficulty] ?? "default"}>
                          {course.difficulty === "beginner" ? "مبتدئ" : course.difficulty === "intermediate" ? "متوسط" : "متقدم"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={course.isPublished ? "success" : "secondary"}>
                          {course.isPublished ? "منشورة" : "مسودة"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleTogglePublish(course)}>
                            {course.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Link href={`/admin/courses/${course.id}`}>
                            <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => { setDeletingCourse(course); setDeleteDialogOpen(true) }}>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-[var(--border)] bg-[var(--card)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)]">حذف الدورة</DialogTitle>
            <DialogDescription className="text-[var(--muted-foreground)]">
              هل أنت متأكد من حذف &quot;{deletingCourse?.title}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-[var(--border)]">إلغاء</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

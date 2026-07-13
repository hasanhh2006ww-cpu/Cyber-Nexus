"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, GripVertical, BookOpen } from "lucide-react"
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

interface PathItem {
  id: string; title: string; slug: string; description: string;
  difficulty: string; estimatedHours: number; isPublished: boolean; isFeatured: boolean;
  _count?: { courses: number };
}

const difficultyVariant: Record<string, "success" | "warning" | "destructive"> = {
  beginner: "success", intermediate: "warning", advanced: "destructive",
}

export default function AdminLearningPathsPage() {
  const router = useRouter()
  const [paths, setPaths] = useState<PathItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPath, setDeletingPath] = useState<PathItem | null>(null)

  const fetchPaths = async () => {
    try {
      const res = await fetch("/api/admin/learning-paths")
      if (!res.ok) throw new Error("Failed to fetch learning paths")
      const data = await res.json()
      setPaths(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPaths() }, [])

  const filtered = useMemo(
    () => paths.filter((p) => p.title.toLowerCase().includes(search.toLowerCase())),
    [paths, search]
  )

  const handleDelete = async () => {
    if (!deletingPath) return
    try {
      const res = await fetch(`/api/admin/learning-paths/${deletingPath.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete learning path")
      toast.success("تم حذف المسار التعليمي")
      setDeleteDialogOpen(false)
      setDeletingPath(null)
      fetchPaths()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const handleTogglePublish = async (path: PathItem) => {
    try {
      const res = await fetch(`/api/admin/learning-paths/${path.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !path.isPublished }),
      })
      if (!res.ok) throw new Error("Failed")
      setPaths((prev) => prev.map((p) => p.id === path.id ? { ...p, isPublished: !p.isPublished } : p))
      toast.success(path.isPublished ? "تم إخفاء المسار" : "تم نشر المسار")
    } catch {
      toast.error("Failed to toggle publish")
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-[var(--secondary)]" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
        <h1 className="text-2xl font-bold text-[var(--foreground)]">المسارات التعليمية</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              placeholder="بحث في المسارات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 border-[var(--border)] bg-[var(--card)] pl-9 text-[var(--foreground)]"
            />
          </div>
          <Link href="/admin/learning-paths/new">
            <Button className="bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Plus className="ml-2 h-4 w-4" /> إضافة مسار
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
                <BookOpen className="h-10 w-10 text-[var(--muted-foreground)] mb-3" />
                <p className="text-[var(--muted-foreground)]">لا توجد مسارات تعليمية.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--border)]">
                    <TableHead className="text-[var(--muted-foreground)]">العنوان</TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">ال Slug</TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">المستوى</TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">الدورات</TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">المدة (ساعة)</TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">الحالة</TableHead>
                    <TableHead className="text-right text-[var(--muted-foreground)]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((path) => (
                    <TableRow key={path.id} className="border-[var(--border)]">
                      <TableCell className="font-medium text-[var(--foreground)]">
                        <div className="flex items-center gap-2">
                          {path.title}
                          {path.isFeatured && <Badge variant="success" className="text-[10px]">مميز</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-[var(--muted-foreground)] font-mono text-sm">{path.slug}</TableCell>
                      <TableCell>
                        <Badge variant={difficultyVariant[path.difficulty] ?? "default"}>
                          {path.difficulty === "beginner" ? "مبتدئ" : path.difficulty === "intermediate" ? "متوسط" : "متقدم"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[var(--foreground)]">{path._count?.courses || 0}</TableCell>
                      <TableCell className="text-[var(--foreground)]">{path.estimatedHours}</TableCell>
                      <TableCell>
                        <Badge variant={path.isPublished ? "success" : "secondary"}>
                          {path.isPublished ? "منشورة" : "مسودة"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleTogglePublish(path)}>
                            {path.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Link href={`/admin/learning-paths/${path.id}`}>
                            <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => { setDeletingPath(path); setDeleteDialogOpen(true) }}>
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
            <DialogTitle className="text-[var(--foreground)]">حذف المسار التعليمي</DialogTitle>
            <DialogDescription className="text-[var(--muted-foreground)]">
              هل أنت متأكد من حذف &quot;{deletingPath?.title}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
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

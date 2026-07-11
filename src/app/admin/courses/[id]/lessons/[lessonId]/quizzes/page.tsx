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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
}

interface Lesson {
  id: string
  title: string
  quiz?: Quiz | null
}

const emptyForm = {
  text: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correctAnswer: "0",
}

export default function AdminQuizzesPage() {
  const params = useParams()
  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [creatingQuiz, setCreatingQuiz] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/courses/${courseId}`)
        if (!res.ok) throw new Error("Failed to fetch course")
        const data = await res.json()
        const courseData = data.course ?? data
        const foundLesson = courseData.lessons?.find(
          (l: Lesson) => l.id === lessonId
        )
        if (!foundLesson) throw new Error("Lesson not found")
        setLesson(foundLesson)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, lessonId])

  const fetchLesson = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`)
      if (!res.ok) throw new Error("Failed to fetch course")
      const data = await res.json()
      const courseData = data.course ?? data
      const foundLesson = courseData.lessons?.find(
        (l: Lesson) => l.id === lessonId
      )
      if (!foundLesson) throw new Error("Lesson not found")
      setLesson(foundLesson)
    } catch {
      // silent refresh failure
    }
  }

  const quiz = lesson?.quiz

  const openCreate = () => {
    setEditingQuestion(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (question: Question) => {
    setEditingQuestion(question)
    setForm({
      text: question.text,
      option1: question.options[0] ?? "",
      option2: question.options[1] ?? "",
      option3: question.options[2] ?? "",
      option4: question.options[3] ?? "",
      correctAnswer: String(question.correctAnswer),
    })
    setDialogOpen(true)
  }

  const openDelete = (question: Question) => {
    setDeletingQuestion(question)
    setDeleteDialogOpen(true)
  }

  const handleCreateQuiz = async () => {
    setCreatingQuiz(true)
    try {
      const res = await fetch(
        `/api/admin/quizzes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: `${lesson?.title} Quiz`, lessonId }),
        }
      )
      if (!res.ok) throw new Error("Failed to create quiz")
      toast.success("Quiz created successfully")
      fetchLesson()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create quiz")
    } finally {
      setCreatingQuiz(false)
    }
  }

  const handleSaveQuestion = async () => {
    if (!quiz) return
    setSaving(true)
    try {
      const options = [form.option1, form.option2, form.option3, form.option4]
      const body = {
        text: form.text,
        options,
        correctAnswer: Number(form.correctAnswer),
        quizId: quiz.id,
      }

      const method = editingQuestion ? "PUT" : "POST"
      const url = editingQuestion
        ? `/api/admin/questions/${editingQuestion.id}`
        : `/api/admin/questions`

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to save question")
      toast.success(
        editingQuestion
          ? "Question updated successfully"
          : "Question added successfully"
      )
      setDialogOpen(false)
      fetchLesson()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save question"
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!quiz || !deletingQuestion) return
    try {
      const res = await fetch(
        `/api/admin/questions/${deletingQuestion.id}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Failed to delete question")
      toast.success("Question deleted successfully")
      setDeleteDialogOpen(false)
      setDeletingQuestion(null)
      fetchLesson()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete question"
      )
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-[var(--secondary)]" />
        <div className="h-48 animate-pulse rounded bg-[var(--secondary)]" />
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-[var(--destructive)]">
              {error ?? "Lesson not found"}
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
          href={`/admin/courses/${courseId}/lessons`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للدروس
        </Link>

        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          اختبار — {lesson.title}
        </h1>
      </motion.div>

      {!quiz ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-[var(--muted-foreground)]">
                هذا الدرس ليس له اختبار بعد.
              </p>
              <Button
                onClick={handleCreateQuiz}
                disabled={creatingQuiz}
                className="bg-[var(--primary)] text-[var(--primary-foreground)]"
              >
                {creatingQuiz ? "جارٍ الإنشاء..." : "إنشاء اختبار"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {quiz.title}
            </h2>
            <Button onClick={openCreate} className="bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Plus className="mr-2 h-4 w-4" />
              إضافة سؤال
            </Button>
          </div>

          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardContent className="p-0">
              {quiz.questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-[var(--muted-foreground)]">
                    لا توجد أسئلة بعد. أضف سؤالك الأول.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-[var(--border)]">
                      <TableHead className="text-[var(--muted-foreground)]">
                        النص
                      </TableHead>
                      <TableHead className="text-[var(--muted-foreground)]">
                        الخيارات
                      </TableHead>
                      <TableHead className="text-[var(--muted-foreground)]">
                        الإجابة الصحيحة
                      </TableHead>
                      <TableHead className="text-right text-[var(--muted-foreground)]">
                        الإجراءات
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quiz.questions.map((question) => (
                      <TableRow
                        key={question.id}
                        className="border-[var(--border)]"
                      >
                        <TableCell className="max-w-xs font-medium text-[var(--foreground)]">
                          {question.text}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {question.options.map((opt, i) => (
                              <Badge
                                key={i}
                                variant={
                                  i === question.correctAnswer
                                    ? "success"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {String.fromCharCode(65 + i)}. {opt}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">
                            {String.fromCharCode(65 + question.correctAnswer)}.{" "}
                            {question.options[question.correctAnswer]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(question)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDelete(question)}
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
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-[var(--border)] bg-[var(--card)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)]">
              {editingQuestion ? "تعديل السؤال" : "إضافة سؤال"}
            </DialogTitle>
            <DialogDescription className="text-[var(--muted-foreground)]">
              {editingQuestion
                ? "حدّث بيانات السؤال أدناه."
                : "أدخل البيانات لإضافة سؤال جديد."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">نص السؤال</Label>
              <Input
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">الخيار أ</Label>
              <Input
                value={form.option1}
                onChange={(e) => setForm({ ...form, option1: e.target.value })}
                className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">الخيار ب</Label>
              <Input
                value={form.option2}
                onChange={(e) => setForm({ ...form, option2: e.target.value })}
                className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">الخيار ج</Label>
              <Input
                value={form.option3}
                onChange={(e) => setForm({ ...form, option3: e.target.value })}
                className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">الخيار د</Label>
              <Input
                value={form.option4}
                onChange={(e) => setForm({ ...form, option4: e.target.value })}
                className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">الإجابة الصحيحة</Label>
              <Select
                value={form.correctAnswer}
                onValueChange={(val) =>
                  setForm({ ...form, correctAnswer: val })
                }
              >
                <SelectTrigger className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[var(--border)] bg-[var(--card)]">
                  <SelectItem value="0">A</SelectItem>
                  <SelectItem value="1">B</SelectItem>
                  <SelectItem value="2">C</SelectItem>
                  <SelectItem value="3">D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-[var(--border)] text-[var(--foreground)]">
                إلغاء
              </Button>
            </DialogClose>
            <Button
              onClick={handleSaveQuestion}
              disabled={saving || !form.text || !form.option1 || !form.option2}
              className="bg-[var(--primary)] text-[var(--primary-foreground)]"
            >
              {saving
                ? "جارٍ الحفظ..."
                : editingQuestion
                  ? "تحديث"
                  : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-[var(--border)] bg-[var(--card)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)]">
              حذف السؤال
            </DialogTitle>
            <DialogDescription className="text-[var(--muted-foreground)]">
              هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-[var(--border)] text-[var(--foreground)]">
                إلغاء
              </Button>
            </DialogClose>
              <Button variant="destructive" onClick={handleDeleteQuestion}>
                حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useRef } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { toast } from "@/components/ui/sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { GripVertical, Plus, Pencil, Trash2, FileText, Video, Link, Code, Image, Archive, FolderOpen, ExternalLink, FileDown, Play, MonitorPlay, RefreshCw, Download } from "lucide-react"
import { CONTENT_TYPES, type ContentType } from "@/types"

interface SectionData {
  id: string
  title: string
  description: string
  order: number
  lessons: LessonData[]
}

interface LessonData {
  id: string
  title: string
  content: string
  contentType: string
  videoUrl: string
  fileUrl: string
  fileType: string
  externalUrl: string
  codeContent: string
  codeLanguage: string
  order: number
  duration: string
  isPreview: boolean
  sectionId?: string | null
}

interface Props {
  courseId: string
  sections: SectionData[]
  orphanLessons: LessonData[]
  onUpdate: () => void
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  text: FileText, youtube: Play, youtube_playlist: Play, gdrive_video: Video,
  gdrive_folder: FolderOpen, vimeo: Video, external_link: ExternalLink,
  pdf: FileDown, zip: Archive, image: Image, code: Code,
}

function getIcon(type: string) {
  return ICON_MAP[type] || FileText
}

function getLabel(type: string) {
  return CONTENT_TYPES.find((c) => c.value === type)?.label || type
}

const emptyLessonForm = {
  title: "", contentType: "text" as ContentType, content: "", videoUrl: "", fileUrl: "",
  fileType: "", externalUrl: "", codeContent: "", codeLanguage: "javascript",
  duration: "", isPreview: false,
}

export function CourseContentBuilder({ courseId, sections, orphanLessons, onUpdate }: Props) {
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<LessonData | null>(null)
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null)
  const [lessonForm, setLessonForm] = useState(emptyLessonForm)
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingType, setDeletingType] = useState<"section" | "lesson">("lesson")
  const fileRef = useRef<HTMLInputElement>(null)
  const [ytDialogOpen, setYtDialogOpen] = useState(false)
  const [ytPlaylistUrl, setYtPlaylistUrl] = useState("")
  const [ytLoading, setYtLoading] = useState(false)
  const [ytProgress, setYtProgress] = useState("")

  const existingYouTubeLessons = sections.reduce((acc, s) => acc + s.lessons.filter((l) => l.contentType === "youtube").length, 0) + orphanLessons.filter((l) => l.contentType === "youtube").length

  const openCreateLesson = (sectionId: string | null) => {
    setEditingLesson(null)
    setTargetSectionId(sectionId)
    setLessonForm(emptyLessonForm)
    setLessonDialogOpen(true)
  }

  const openEditLesson = (lesson: LessonData) => {
    setEditingLesson(lesson)
    setTargetSectionId(lesson.sectionId || null)
    setLessonForm({
      title: lesson.title, contentType: lesson.contentType as ContentType, content: (lesson as LessonData & { content?: string }).content || "",
      videoUrl: lesson.videoUrl, fileUrl: lesson.fileUrl, fileType: lesson.fileType,
      externalUrl: lesson.externalUrl, codeContent: lesson.codeContent,
      codeLanguage: lesson.codeLanguage, duration: lesson.duration, isPreview: lesson.isPreview,
    })
    setLessonDialogOpen(true)
  }

  const handleSaveLesson = async () => {
    setSaving(true)
    try {
      const method = editingLesson ? "PUT" : "POST"
      const url = editingLesson ? `/api/admin/lessons/${editingLesson.id}` : "/api/admin/lessons"
      const body = editingLesson
        ? { ...lessonForm }
        : { ...lessonForm, courseId, sectionId: targetSectionId, order: 0 }

      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to save lesson")
      toast.success(editingLesson ? "تم تحديث الدرس" : "تم إنشاء الدرس")
      setLessonDialogOpen(false)
      onUpdate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save lesson")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      const url = deletingType === "section" ? `/api/admin/sections/${deletingId}` : `/api/admin/lessons/${deletingId}`
      const res = await fetch(url, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success(deletingType === "section" ? "تم حذف القسم" : "تم حذف الدرس")
      setDeleteDialogOpen(false)
      onUpdate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const handleAddSection = async () => {
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "قسم جديد", order: sections.length, courseId }),
      })
      if (!res.ok) throw new Error("Failed to create section")
      toast.success("تم إنشاء القسم")
      onUpdate()
    } catch {
      toast.error("فشل إنشاء القسم")
    }
  }

  const handleUpdateSectionTitle = async (sectionId: string, title: string) => {
    try {
      await fetch(`/api/admin/sections/${sectionId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      onUpdate()
    } catch {
      toast.error("Failed to update section")
    }
  }

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      setLessonForm((prev) => ({ ...prev, fileUrl: data.url, fileType: file.type }))
    } catch {
      toast.error("فشل رفع الملف")
    }
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const { source, destination, type } = result

    if (type === "section") {
      const reordered = Array.from(sections)
      const [moved] = reordered.splice(source.index, 1)
      reordered.splice(destination.index, 0, moved)
      const items = reordered.map((s, i) => ({ id: s.id, order: i }))
      try {
        await fetch("/api/admin/sections/reorder", {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        })
        onUpdate()
      } catch { toast.error("Failed to reorder") }
      return
    }

    const lessonItems = result.draggableId
    const srcSectionId = source.droppableId === "orphan" ? null : source.droppableId
    const dstSectionId = destination.droppableId === "orphan" ? null : destination.droppableId

    const allLessons: { id: string; order: number; sectionId: string | null }[] = []
    for (const sec of sections) {
      for (let i = 0; i < sec.lessons.length; i++) {
        if (sec.lessons[i].id === lessonItems && srcSectionId !== dstSectionId) {
          allLessons.push({ id: lessonItems, order: destination.index, sectionId: dstSectionId })
        } else {
          allLessons.push({ id: sec.lessons[i].id, order: i, sectionId: sec.id })
        }
      }
    }
    for (let i = 0; i < orphanLessons.length; i++) {
      if (orphanLessons[i].id === lessonItems && srcSectionId !== dstSectionId) {
        allLessons.push({ id: lessonItems, order: destination.index, sectionId: dstSectionId })
      } else {
        allLessons.push({ id: orphanLessons[i].id, order: i, sectionId: null })
      }
    }

    try {
      await fetch("/api/admin/lessons/reorder", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: allLessons }),
      })
      onUpdate()
    } catch { toast.error("Failed to reorder") }
  }

  const handleYouTubeAction = async (action: "import" | "sync" | "update") => {
    if (action !== "update" && !ytPlaylistUrl.trim()) {
      toast.error("أدخل رابط Playlist")
      return
    }
    setYtLoading(true)
    const labels = { import: "جارٍ الاستيراد...", sync: "جارٍ المزامنة...", update: "جارٍ التحديث..." }
    setYtProgress(labels[action])
    try {
      const res = await fetch("/api/admin/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, playlistUrl: ytPlaylistUrl, courseId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Operation failed")
      if (action === "update") {
        toast.success(`تم تحديث ${data.updated} من ${data.total} درس`)
      } else {
        toast.success(`تم الاستيراد: ${data.imported} جديد، ${data.data?.skipped || data.skipped} مكرر، ${data.data?.failed || data.failed} فاشل`)
      }
      setYtDialogOpen(false)
      setYtPlaylistUrl("")
      onUpdate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed")
    } finally {
      setYtLoading(false)
      setYtProgress("")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">محتوى الدورة</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-[var(--border)]" onClick={() => setYtDialogOpen(true)}>
            <MonitorPlay className="ml-2 h-4 w-4" /> استيراد من YouTube Playlist
          </Button>
          <Button onClick={handleAddSection} className="bg-[var(--primary)] text-[var(--primary-foreground)]">
            <Plus className="ml-2 h-4 w-4" /> إضافة قسم
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
              {sections.map((section, si) => (
                <Draggable key={section.id} draggableId={section.id} index={si}>
                  {(prov) => (
                    <div ref={prov.innerRef} {...prov.draggableProps}>
                      <Card className="border-[var(--border)] bg-[var(--card)]">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div {...prov.dragHandleProps}>
                              <GripVertical className="h-5 w-5 text-[var(--muted-foreground)] cursor-grab" />
                            </div>
                            <SectionTitleEdit title={section.title} onSave={(t) => handleUpdateSectionTitle(section.id, t)} />
                            <Button variant="ghost" size="sm" className="mr-auto" onClick={() => openCreateLesson(section.id)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setDeletingId(section.id); setDeletingType("section"); setDeleteDialogOpen(true) }}>
                              <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Droppable droppableId={section.id} type="lesson">
                            {(dropProv) => (
                              <div ref={dropProv.innerRef} {...dropProv.droppableProps} className="space-y-2 min-h-[40px]">
                                {section.lessons.map((lesson, li) => (
                                  <LessonItem key={lesson.id} lesson={lesson} index={li} onEdit={openEditLesson}
                                    onDelete={(id) => { setDeletingId(id); setDeletingType("lesson"); setDeleteDialogOpen(true) }} />
                                ))}
                                {dropProv.placeholder}
                                {section.lessons.length === 0 && (
                                  <p className="text-sm text-[var(--muted-foreground)] text-center py-4">اسحب الدروس هنا أو أضف درساً جديداً</p>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {orphanLessons.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">دروس بدون قسم</h4>
            <Droppable droppableId="orphan" type="lesson">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 border border-dashed border-[var(--border)] rounded-lg p-4">
                  {orphanLessons.map((lesson, i) => (
                    <LessonItem key={lesson.id} lesson={lesson} index={i} onEdit={openEditLesson}
                      onDelete={(id) => { setDeletingId(id); setDeletingType("lesson"); setDeleteDialogOpen(true) }} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </DragDropContext>

      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="border-[var(--border)] bg-[var(--card)] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)]">{editingLesson ? "تعديل الدرس" : "إضافة درس"}</DialogTitle>
            <DialogDescription className="text-[var(--muted-foreground)]">
              {editingLesson ? "حدّث بيانات الدرس" : "أدخل بيانات الدرس الجديد"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">عنوان الدرس *</Label>
              <Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">نوع المحتوى</Label>
              <Select value={lessonForm.contentType} onValueChange={(v) => setLessonForm({ ...lessonForm, contentType: v as ContentType })}>
                <SelectTrigger className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"><SelectValue /></SelectTrigger>
                <SelectContent className="border-[var(--border)] bg-[var(--card)]">
                  {CONTENT_TYPES.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">المدة</Label>
                <Input value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" placeholder="مثال: 15 دقيقة" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={lessonForm.isPreview} onCheckedChange={(v) => setLessonForm({ ...lessonForm, isPreview: v })} />
                <Label className="text-[var(--foreground)]">درس معاينة</Label>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <Label className="text-[var(--foreground)] font-medium">محتوى الدرس</Label>
              <div className="mt-2">
                {lessonForm.contentType === "text" && (
                  <Textarea value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value } as typeof lessonForm)} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" rows={6} placeholder="اكتب محتوى الدرس هنا..." />
                )}
                {(lessonForm.contentType === "youtube" || lessonForm.contentType === "youtube_playlist") && (
                  <div className="space-y-2">
                    <Input value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" placeholder={lessonForm.contentType === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://www.youtube.com/playlist?list=..."} />
                    {lessonForm.contentType === "youtube_playlist" && (
                      <p className="text-xs text-[var(--muted-foreground)]">سيتم عرض القائمة كدرس واحد. لإنشاء دروس متعددة، أنشئ كل فيديو كدرس منفصل.</p>
                    )}
                  </div>
                )}
                {(lessonForm.contentType === "gdrive_video" || lessonForm.contentType === "gdrive_folder") && (
                  <Input value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" placeholder={lessonForm.contentType === "gdrive_video" ? "https://drive.google.com/file/d/..." : "https://drive.google.com/drive/folders/..."} />
                )}
                {lessonForm.contentType === "vimeo" && (
                  <Input value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" placeholder="https://vimeo.com/..." />
                )}
                {lessonForm.contentType === "external_link" && (
                  <Input value={lessonForm.externalUrl} onChange={(e) => setLessonForm({ ...lessonForm, externalUrl: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" placeholder="https://..." />
                )}
                {(lessonForm.contentType === "pdf" || lessonForm.contentType === "zip" || lessonForm.contentType === "image") && (
                  <div className="space-y-2">
                    <input ref={fileRef} type="file" accept={lessonForm.contentType === "pdf" ? ".pdf" : lessonForm.contentType === "zip" ? ".zip" : "image/*"} className="hidden" onChange={handleUploadFile} />
                    {lessonForm.fileUrl && <p className="text-sm text-[var(--success)]">✓ تم رفع الملف: {lessonForm.fileUrl.split("/").pop()}</p>}
                    <Button type="button" variant="outline" className="border-[var(--border)]" onClick={() => fileRef.current?.click()}>
                      <FileDown className="ml-2 h-4 w-4" /> رفع ملف
                    </Button>
                  </div>
                )}
                {lessonForm.contentType === "code" && (
                  <div className="space-y-2">
                    <Select value={lessonForm.codeLanguage} onValueChange={(v) => setLessonForm({ ...lessonForm, codeLanguage: v })}>
                      <SelectTrigger className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[var(--border)] bg-[var(--card)]">
                        {["javascript", "python", "html", "css", "java", "csharp", "cpp", "php", "typescript", "sql", "bash"].map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea value={lessonForm.codeContent} onChange={(e) => setLessonForm({ ...lessonForm, codeContent: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono text-sm" rows={8} placeholder="اكتب الكود هنا..." />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-[var(--border)]">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSaveLesson} disabled={saving || !lessonForm.title} className="bg-[var(--primary)] text-[var(--primary-foreground)]">
              {saving ? "جارٍ الحفظ..." : editingLesson ? "تحديث" : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-[var(--border)] bg-[var(--card)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)]">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-[var(--muted-foreground)]">
              هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.
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

      <Dialog open={ytDialogOpen} onOpenChange={(o) => { if (!ytLoading) { setYtDialogOpen(o); if (!o) { setYtPlaylistUrl(""); setYtProgress("") } } }}>
        <DialogContent className="border-[var(--border)] bg-[var(--card)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)] flex items-center gap-2">
              <MonitorPlay className="h-5 w-5" /> استيراد من YouTube Playlist
            </DialogTitle>
            <DialogDescription className="text-[var(--muted-foreground)]">
              أدخل رابط قائمة التشغيل لاستيراد الفيديوهات كدروس
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">رابط Playlist</Label>
              <Input
                value={ytPlaylistUrl}
                onChange={(e) => setYtPlaylistUrl(e.target.value)}
                placeholder="https://www.youtube.com/playlist?list=PL..."
                disabled={ytLoading}
                className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                يُضاف كل فيديو كدرس منفصل. يتم تخطي الفيديوهات المكررة تلقائيًا.
              </p>
            </div>
            {ytLoading && ytProgress && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--secondary)]/50 border border-[var(--border)]">
                <div className="animate-spin h-4 w-4 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
                <span className="text-sm text-[var(--foreground)]">{ytProgress}</span>
              </div>
            )}
            {existingYouTubeLessons > 0 && (
              <div className="p-3 rounded-lg bg-[var(--secondary)]/30 border border-[var(--border)]">
                <p className="text-xs text-[var(--muted-foreground)]">
                  هذه الدورة تحتوي على {existingYouTubeLessons} درس YouTube موجود بالفعل.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="border-[var(--border)]" disabled={ytLoading}>إلغاء</Button>
            </DialogClose>
            {existingYouTubeLessons > 0 && (
              <Button variant="outline" className="border-[var(--border)]" disabled={ytLoading} onClick={() => handleYouTubeAction("update")}>
                <RefreshCw className="ml-2 h-4 w-4" /> تحديث بيانات الفيديوهات
              </Button>
            )}
            {existingYouTubeLessons > 0 && (
              <Button variant="outline" className="border-[var(--border)]" disabled={ytLoading || !ytPlaylistUrl.trim()} onClick={() => handleYouTubeAction("sync")}>
                <Download className="ml-2 h-4 w-4" /> مزامنة Playlist
              </Button>
            )}
            <Button className="bg-[var(--primary)] text-[var(--primary-foreground)]" disabled={ytLoading || !ytPlaylistUrl.trim()} onClick={() => handleYouTubeAction("import")}>
              <MonitorPlay className="ml-2 h-4 w-4" /> استيراد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LessonItem({ lesson, index, onEdit, onDelete }: { lesson: LessonData; index: number; onEdit: (l: LessonData) => void; onDelete: (id: string) => void }) {
  const Icon = getIcon(lesson.contentType)
  return (
    <Draggable draggableId={lesson.id} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--secondary)]/50 border border-[var(--border)]">
          <div {...provided.dragHandleProps}>
            <GripVertical className="h-4 w-4 text-[var(--muted-foreground)] cursor-grab" />
          </div>
          <Icon className="h-4 w-4 text-[var(--primary)] shrink-0" />
          <span className="text-sm font-medium text-[var(--foreground)] truncate flex-1">{lesson.title}</span>
          <Badge variant="outline" className="text-xs shrink-0">{getLabel(lesson.contentType)}</Badge>
          {lesson.duration && <Badge variant="secondary" className="text-xs shrink-0">{lesson.duration}</Badge>}
          {lesson.isPreview && <Badge variant="success" className="text-xs shrink-0">معاينة</Badge>}
          <Button variant="ghost" size="sm" className="shrink-0 h-7 w-7 p-0" onClick={() => onEdit(lesson)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="shrink-0 h-7 w-7 p-0" onClick={() => onDelete(lesson.id)}>
            <Trash2 className="h-3 w-3 text-[var(--destructive)]" />
          </Button>
        </div>
      )}
    </Draggable>
  )
}

function SectionTitleEdit({ title, onSave }: { title: string; onSave: (t: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(title)

  if (editing) {
    return (
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => { setEditing(false); if (value.trim() && value !== title) onSave(value.trim()); else setValue(title) }}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
        className="flex-1 h-8 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
        autoFocus
      />
    )
  }

  return (
    <span className="text-sm font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)]" onClick={() => setEditing(true)}>
      {title}
    </span>
  )
}

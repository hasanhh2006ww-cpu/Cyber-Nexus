"use client"

import { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Upload, X, Plus } from "lucide-react"
import { useState } from "react"

export interface CourseFormData {
  title: string
  description: string
  descriptionLong: string
  category: string
  difficulty: string
  language: string
  duration: string
  instructorName: string
  instructorBio: string
  instructorAvatar: string
  thumbnail: string
  banner: string
  tags: string[]
  isFree: boolean
  isPublished: boolean
  isFeatured: boolean
  sortOrder: number
  commentsEnabled: boolean
  reviewsEnabled: boolean
  xpPoints: number
  certificateEnabled: boolean
}

interface CourseInfoFormProps {
  course: CourseFormData
  onChange: (data: Partial<CourseFormData>) => void
}

async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append("file", file)
  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    if (!res.ok) throw new Error("Upload failed")
    const data = await res.json()
    return data.url
  } catch {
    toast.error("فشل رفع الملف")
    return null
  }
}

function ImageUpload({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadFile(file)
    if (url) onChange(url)
    setUploading(false)
    if (ref.current) ref.current.value = ""
  }

  return (
    <div className="space-y-2">
      <Label className="text-[var(--foreground)]">{label}</Label>
      {value && (
        <div className="relative mb-2">
          <img src={value} alt={label} className="h-32 w-full rounded-lg object-cover border border-[var(--border)]" />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={() => onChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Button
        type="button"
        variant="outline"
        className="w-full border-[var(--border)]"
        onClick={() => ref.current?.click()}
        disabled={uploading}
      >
        <Upload className="ml-2 h-4 w-4" />
        {uploading ? "جارٍ الرفع..." : "رفع صورة"}
      </Button>
    </div>
  )
}

export function CourseInfoForm({ course, onChange }: CourseInfoFormProps) {
  const [tagInput, setTagInput] = useState("")

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !course.tags.includes(tag)) {
      onChange({ tags: [...course.tags, tag] })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    onChange({ tags: course.tags.filter((t) => t !== tag) })
  }

  return (
    <div className="space-y-6">
      <Card className="border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">معلومات أساسية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[var(--foreground)]">عنوان الدورة *</Label>
              <Input value={course.title} onChange={(e) => onChange({ title: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" placeholder="أدخل عنوان الدورة" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[var(--foreground)]">وصف مختصر *</Label>
              <Textarea value={course.description} onChange={(e) => onChange({ description: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" rows={3} placeholder="وصف مختصر للدورة" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[var(--foreground)]">وصف تفصيلي</Label>
              <Textarea value={course.descriptionLong} onChange={(e) => onChange({ descriptionLong: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" rows={6} placeholder="اكتب وصفاً تفصيلياً للدورة..." />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">التصنيف *</Label>
              <Input value={course.category} onChange={(e) => onChange({ category: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" placeholder="مثال: أمن سيبراني" />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">المستوى</Label>
              <Select value={course.difficulty} onValueChange={(v) => onChange({ difficulty: v })}>
                <SelectTrigger className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"><SelectValue /></SelectTrigger>
                <SelectContent className="border-[var(--border)] bg-[var(--card)]">
                  <SelectItem value="beginner">مبتدئ</SelectItem>
                  <SelectItem value="intermediate">متوسط</SelectItem>
                  <SelectItem value="advanced">متقدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">اللغة</Label>
              <Select value={course.language} onValueChange={(v) => onChange({ language: v })}>
                <SelectTrigger className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"><SelectValue /></SelectTrigger>
                <SelectContent className="border-[var(--border)] bg-[var(--card)]">
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">المدة *</Label>
              <Input value={course.duration} onChange={(e) => onChange({ duration: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" placeholder="مثال: 4 أسابيع" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">المدرب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">اسم المدرب</Label>
              <Input value={course.instructorName} onChange={(e) => onChange({ instructorName: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" />
            </div>
            <ImageUpload label="صورة المدرب" value={course.instructorAvatar} onChange={(url) => onChange({ instructorAvatar: url })} />
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[var(--foreground)]">نبذة عن المدرب</Label>
              <Textarea value={course.instructorBio} onChange={(e) => onChange({ instructorBio: e.target.value })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]" rows={3} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">الوسائط</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload label="صورة مصغرة للدورة" value={course.thumbnail} onChange={(url) => onChange({ thumbnail: url })} />
            <ImageUpload label="صورة غلاف" value={course.banner} onChange={(url) => onChange({ banner: url })} />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--foreground)]">الوسوم</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
                className="flex-1 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                placeholder="أضف وسماً..."
              />
              <Button type="button" variant="outline" className="border-[var(--border)]" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {course.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-[var(--destructive)]">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">الإعدادات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <Label className="text-[var(--foreground)]">دورة مجانية</Label>
              <Switch checked={course.isFree} onCheckedChange={(v) => onChange({ isFree: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[var(--foreground)]">منشورة</Label>
              <Switch checked={course.isPublished} onCheckedChange={(v) => onChange({ isPublished: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[var(--foreground)]">مميزة</Label>
              <Switch checked={course.isFeatured} onCheckedChange={(v) => onChange({ isFeatured: v })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">ترتيب الظهور</Label>
              <Input type="number" value={course.sortOrder} onChange={(e) => onChange({ sortOrder: parseInt(e.target.value) || 0 })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] w-24" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[var(--foreground)]">تفعيل التعليقات</Label>
              <Switch checked={course.commentsEnabled} onCheckedChange={(v) => onChange({ commentsEnabled: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[var(--foreground)]">تفعيل التقييم</Label>
              <Switch checked={course.reviewsEnabled} onCheckedChange={(v) => onChange({ reviewsEnabled: v })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">نقاط XP</Label>
              <Input type="number" value={course.xpPoints} onChange={(e) => onChange({ xpPoints: parseInt(e.target.value) || 0 })} className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] w-24" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[var(--foreground)]">شهادة عند الإكمال</Label>
              <Switch checked={course.certificateEnabled} onCheckedChange={(v) => onChange({ certificateEnabled: v })} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

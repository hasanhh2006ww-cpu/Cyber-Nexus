"use client"

import { useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { Upload, X } from "lucide-react"

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

interface ImageUploadProps {
  label: string
  value: string
  onChange: (url: string) => void
}

export function ImageUpload({ label, value, onChange }: ImageUploadProps) {
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

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.files
    if (!items || items.length === 0) return
    const file = items[0]
    if (!file.type.startsWith("image/")) return
    e.preventDefault()
    setUploading(true)
    const url = await uploadFile(file)
    if (url) onChange(url)
    setUploading(false)
  }

  return (
    <div className="space-y-2" onPaste={handlePaste}>
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

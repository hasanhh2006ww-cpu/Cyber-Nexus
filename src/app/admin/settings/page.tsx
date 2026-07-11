"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Shield, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
}

export default function AdminSettingsPage() {
  const { data: sessionData } = useSession()
  const session = sessionData as { user: SessionUser } | null

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
          الإعدادات
        </h1>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)]">
                معلومات الموقع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">اسم الموقع</Label>
                <Input
                  value="Cyber Nexus"
                  disabled
                  className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>
              <Separator className="bg-[var(--border)]" />
              <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
                <p className="text-sm text-[var(--muted-foreground)]">
                  تُدار إعدادات الموقع عبر متغيرات البيئة وملفات الإعدادات. اتصل بمسؤول النظام لإجراء التغييرات.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)]">
                معلومات المنصة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">
                  المنصة
                </span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Cyber Nexus
                </span>
              </div>
              <Separator className="bg-[var(--border)]" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">
                  الإطار
                </span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Next.js
                </span>
              </div>
              <Separator className="bg-[var(--border)]" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">
                  لوحة المسؤول
                </span>
                <Badge variant="success">نشط</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
                <Shield className="h-5 w-5" />
                حساب المسؤول
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">
                  الاسم
                </span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {session?.user?.name ?? "—"}
                </span>
              </div>
              <Separator className="bg-[var(--border)]" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">
                  البريد الإلكتروني
                </span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {session?.user?.email ?? "—"}
                </span>
              </div>
              <Separator className="bg-[var(--border)]" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">
                  الدور
                </span>
                <Badge variant="destructive">
                  {session?.user?.role ?? "—"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

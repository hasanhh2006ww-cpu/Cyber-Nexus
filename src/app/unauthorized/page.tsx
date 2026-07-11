"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md border-[var(--border)] bg-[var(--card)]">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--destructive)]/10">
              <ShieldOff className="h-8 w-8 text-[var(--destructive)]" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">
              الوصول مرفوض
            </h1>
            <p className="mb-8 text-[var(--muted-foreground)]">
              ليس لديك صلاحية للوصول إلى هذه الصفحة.
            </p>
            <Link href="/">
              <Button className="bg-[var(--primary)] text-[var(--primary-foreground)]">
                العودة للرئيسية
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

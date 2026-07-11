"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, BookOpen, FileText, ClipboardCheck, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Stats {
  totalStudents: number
  totalCourses: number
  totalLessons: number
  totalQuizzes: number
  mostStudiedCourse: string | null
  averageQuizScore: number
  registrationTrend: { month: string; count: number }[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        if (!res.ok) throw new Error("Failed to fetch statistics")
        const data = await res.json()
        setStats(data.stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-[var(--secondary)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg bg-[var(--secondary)]"
            />
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

  const summaryCards = [
    {
      title: "الطلاب",
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "الدورات",
      value: stats?.totalCourses ?? 0,
      icon: BookOpen,
      color: "text-emerald-500",
    },
    {
      title: "الدروس",
      value: stats?.totalLessons ?? 0,
      icon: FileText,
      color: "text-violet-500",
    },
    {
      title: "الاختبارات",
      value: stats?.totalQuizzes ?? 0,
      icon: ClipboardCheck,
      color: "text-amber-500",
    },
  ]

  const trend = stats?.registrationTrend ?? []
  const maxCount = Math.max(...trend.map((t) => t.count), 1)

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
          الإحصائيات
        </h1>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {summaryCards.map((card) => (
          <motion.div key={card.title} variants={item}>
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--secondary)]">
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
                <TrendingUp className="h-5 w-5" />
                الأكثر دراسة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.mostStudiedCourse ? (
                <p className="text-lg font-medium text-[var(--foreground)]">
                  {stats.mostStudiedCourse}
                </p>
              ) : (
                <p className="text-[var(--muted-foreground)]">
                  لا توجد بيانات دورات حتى الآن.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)]">
                متوسط درجات الاختبارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Progress
                  value={stats?.averageQuizScore ?? 0}
                  className="h-3 flex-1"
                />
                <span className="text-lg font-bold text-[var(--foreground)]">
                  {stats?.averageQuizScore ?? 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)]">
              اتجاه تسجيل المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length === 0 ? (
              <p className="py-8 text-center text-[var(--muted-foreground)]">
                لا توجد بيانات تسجيل.
              </p>
            ) : (
              <div className="flex items-end gap-2" style={{ height: 200 }}>
                {trend.map((t) => (
                  <div
                    key={t.month}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {t.count}
                    </span>
                    <div
                      className="w-full rounded-t bg-[var(--primary)]"
                      style={{
                        height: `${(t.count / maxCount) * 160}px`,
                        minHeight: "4px",
                      }}
                    />
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {t.month}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

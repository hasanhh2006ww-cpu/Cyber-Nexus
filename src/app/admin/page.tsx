"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  BookOpen,
  FileText,
  ClipboardCheck,
  UserCheck,
  UserPlus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Stats {
  totalUsers: number
  totalCourses: number
  totalLessons: number
  totalQuizzes: number
  activeUsers: number
  recentRegistrations: number
}

interface RecentUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        if (!res.ok) throw new Error("Failed to fetch stats")
        const data = await res.json()
        setStats(data.stats)
        setRecentUsers(data.recentUsers ?? [])
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
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded bg-[var(--secondary)]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      title: "إجمالي المستخدمين",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "إجمالي الدورات",
      value: stats?.totalCourses ?? 0,
      icon: BookOpen,
      color: "text-emerald-500",
    },
    {
      title: "إجمالي الدروس",
      value: stats?.totalLessons ?? 0,
      icon: FileText,
      color: "text-violet-500",
    },
    {
      title: "إجمالي الاختبارات",
      value: stats?.totalQuizzes ?? 0,
      icon: ClipboardCheck,
      color: "text-amber-500",
    },
    {
      title: "المستخدمون النشطون",
      value: stats?.activeUsers ?? 0,
      icon: UserCheck,
      color: "text-cyan-500",
    },
    {
      title: "التسجيلات الأخيرة",
      value: stats?.recentRegistrations ?? 0,
      icon: UserPlus,
      color: "text-pink-500",
    },
  ]

  return (
    <div className="p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
          لوحة تحكم المسؤول
        </h1>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {statCards.map((card) => (
          <motion.div key={card.title} variants={item}>
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardContent className="flex items-center gap-4 p-6">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--secondary)]`}
                >
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)]">
              المستخدمون الأخيرون
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="py-8 text-center text-[var(--muted-foreground)]">
                لا يوجد مستخدمون حتى الآن.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--border)]">
                    <TableHead className="text-[var(--muted-foreground)]">
                      الاسم
                    </TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">
                      البريد الإلكتروني
                    </TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">
                      الدور
                    </TableHead>
                    <TableHead className="text-[var(--muted-foreground)]">
                      تاريخ الانضمام
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-[var(--border)]"
                    >
                      <TableCell className="text-[var(--foreground)]">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-[var(--foreground)]">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "destructive" : "default"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[var(--muted-foreground)]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Shield,
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/courses", label: "الدورات", icon: BookOpen },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/statistics", label: "الإحصائيات", icon: BarChart3 },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-5">
        <Shield className="h-6 w-6 text-[var(--primary)]" />
        <span className="text-lg font-bold text-[var(--foreground)]">
          Cyber Nexus Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const active = isActive(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[var(--border)] px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
        >
          <ArrowLeft className="h-5 w-5" />
          العودة للموقع
        </Link>
      </div>
    </aside>
  )
}

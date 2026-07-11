"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Shield, LogOut, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-[var(--primary)]" />
          <span className="text-xl font-bold tracking-tight">
            Cyber<span className="text-[var(--primary)]">Nexus</span>
          </span>
        </Link>

        {!isAuthPage && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/courses"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              الدورات
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                لوحة التحكم
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-[var(--radius)] px-3 py-2 hover:bg-[var(--accent)] transition-colors"
              >
                <Avatar fallback={session.user?.name || ""} className="h-8 w-8" />
                <span className="hidden sm:inline text-sm font-medium">
                  {session.user?.name}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[var(--muted-foreground)]"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">ابدأ الآن</Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

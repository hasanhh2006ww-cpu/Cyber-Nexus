"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ ما. يرجى المحاولة مرة أخرى.");
        return;
      }

      setSuccess("تم إنشاء الحساب بنجاح! جارٍ تسجيل الدخول...");

      await new Promise((r) => setTimeout(r, 800));

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("تم إنشاء الحساب لكن فشل تسجيل الدخول. يرجى الذهاب إلى صفحة تسجيل الدخول.");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("حدث خطأ ما. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-[var(--primary)]" />
            <span className="text-2xl font-bold">
              Cyber<span className="text-[var(--primary)]">Nexus</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold">إنشاء حساب</h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            ابدأ رحلة تعلمك في الأمن السيبراني
          </p>
        </div>

        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-[var(--radius)] bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 p-3 text-sm text-[var(--destructive)]">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-[var(--radius)] bg-[var(--success)]/10 border border-[var(--success)]/20 p-3 text-sm text-[var(--success)] flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/login"
                className="text-[var(--primary)] hover:underline"
              >
                سجّل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

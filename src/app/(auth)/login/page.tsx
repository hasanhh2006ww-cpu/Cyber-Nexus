"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
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
      if (!email.trim()) {
        setError("يرجى إدخال بريدك الإلكتروني.");
        setLoading(false);
        return;
      }

      if (!password) {
        setError("يرجى إدخال كلمة المرور.");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق من بياناتك والمحاولة مرة أخرى.");
        return;
      }

      if (result?.ok) {
        setSuccess("تم تسجيل الدخول بنجاح! جارٍ التحويل...");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً.");
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
          <h1 className="text-2xl font-bold">مرحباً بك مجدداً</h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            سجل الدخول لمتابعة رحلة التعلم
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                className="text-[var(--primary)] hover:underline"
              >
                سجّل الآن
              </Link>
            </div>

            <div className="mt-4 p-3 rounded-[var(--radius)] bg-[var(--secondary)]/50 text-xs text-[var(--muted-foreground)]">
              <p className="font-medium mb-1">حسابات تجريبية:</p>
              <p>ahmed@example.com / password123</p>
              <p>sara@example.com / password123</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Shield,
  BookOpen,
  Award,
  Users,
  ArrowRight,
  CheckCircle,
  Zap,
  Lock,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";

const features = [
  {
    icon: BookOpen,
    title: "دورات احترافية",
    description:
      "دورات منهجية صممتها متخصصو الأمن السيبراني تغطي المواضيع الأساسية.",
  },
  {
    icon: CheckCircle,
    title: "اختبارات تفاعلية",
    description:
      "اختبر معلوماتك باختبارات بعد كل درس لتعزيز تعلمك.",
  },
  {
    icon: Zap,
    title: "تتبع التقدم",
    description:
      "تابع رحلة تعلمك مع تتبع مفصل للتقدم والتحليلات.",
  },
  {
    icon: Lock,
    title: "تعلم عملي",
    description:
      "تمارين عملية وسيناريوهات واقعية لبناء مهاراتك.",
  },
];

const stats = [
  { label: "الدورات", value: "10+" },
  { label: "الدروس", value: "40+" },
  { label: "الاختبارات", value: "40+" },
  { label: "الطلاب", value: "1000+" },
];

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_70%)] opacity-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-4xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--muted-foreground)]">
            <Terminal className="h-4 w-4 text-[var(--primary)]" />
            تعلم الأمن السيبراني
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            مرحباً بك في{" "}
            <span className="text-[var(--primary)]">سايبر</span>نكسس
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--muted-foreground)] sm:text-xl">
            منصتك الشاملة لتعلم الأمن السيبراني. تعلم القرصنة الأخلاقية
            وأمن الشبكات والتشفير والمزيد مع دورات منهجية وتمارين عملية.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="text-base px-8">
                  الذهاب للوحة التحكم
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="text-base px-8">
                    ابدأ التعلم
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="text-base px-8">
                    تسجيل الدخول
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-[var(--border)] bg-[var(--card)]/50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-[var(--primary)]">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              كل ما تحتاجه للتعلم
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
              منصتنا توفر جميع الأدوات والموارد التي تحتاجها لإتقان
              الأمن السيبراني من الصفر.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)]/10">
                      <feature.icon className="h-6 w-6 text-[var(--primary)]" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <Card className="border-[var(--primary)] bg-gradient-to-br from-[var(--primary)]/10 to-[var(--card)]">
            <CardContent className="p-12 text-center">
              <Shield className="mx-auto mb-6 h-12 w-12 text-[var(--primary)]" />
              <h2 className="mb-4 text-3xl font-bold">مستعد للبدء؟</h2>
              <p className="mb-8 text-[var(--muted-foreground)] max-w-xl mx-auto">
                انضم إلى آلاف الطلاب في بناء مسيرتهم في الأمن السيبراني.
                ابدأ رحلة تعلمك اليوم.
              </p>
              {!session && (
                <Link href="/register">
                  <Button size="lg" className="text-base px-8">
                    إنشاء حساب مجاني
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-4">
        <div className="mx-auto max-w-7xl text-center text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-[var(--primary)]" />
            <span className="font-semibold">CyberNexus</span>
          </div>
          <p>منصة تعلم الأمن السيبراني. مبنية للجيل القادم.</p>
        </div>
      </footer>
    </div>
  );
}

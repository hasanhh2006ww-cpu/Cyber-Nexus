"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Clock, BookOpen, Brain, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DashboardStats } from "./types";

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) return <span className="flex items-center gap-0.5 text-xs text-green-400"><TrendingUp className="h-3 w-3" />+{value}</span>;
  if (value < 0) return <span className="flex items-center gap-0.5 text-xs text-red-400"><TrendingDown className="h-3 w-3" />{value}</span>;
  return <span className="flex items-center gap-0.5 text-xs text-[var(--muted-foreground)]"><Minus className="h-3 w-3" />0</span>;
}

export function StatsBar({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: "سلسلة التعلم",
      value: `${stats.streak}`,
      suffix: "أيام",
      icon: Flame,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "ساعات التعلم",
      value: stats.studyHours.toString(),
      suffix: "ساعة",
      icon: Clock,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "الدروس المكتملة",
      value: stats.lessonsCompleted.toString(),
      suffix: `/ ${stats.totalLessons}`,
      icon: BookOpen,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "متوسط الاختبارات",
      value: `${stats.averageScore}`,
      suffix: "%",
      icon: Brain,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
        >
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4.5 w-4.5 ${card.color}`} />
                </div>
                <TrendIndicator value={0} />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">{card.title}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[var(--foreground)]">{card.value}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{card.suffix}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

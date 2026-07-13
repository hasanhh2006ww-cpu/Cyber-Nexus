"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Trophy, BookOpen, Star, XCircle, Clock } from "lucide-react";
import type { ActivityItem } from "./types";

const TYPE_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  lesson_completed: { icon: CheckCircle, color: "text-green-400 bg-green-500/10", label: "أكمل درس" },
  quiz_passed: { icon: Trophy, color: "text-yellow-400 bg-yellow-500/10", label: "اجتز اختبار" },
  quiz_failed: { icon: XCircle, color: "text-red-400 bg-red-500/10", label: "أجتز اختبار" },
  course_started: { icon: BookOpen, color: "text-blue-400 bg-blue-500/10", label: "بدأ دورة" },
  chapter_finished: { icon: Star, color: "text-purple-400 bg-purple-500/10", label: "أنهى فصل" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

export function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">النشاط الأخير</h2>
      <Card className="border-[var(--border)] bg-[var(--card)]">
        <CardContent className="p-6">
          {activities.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-8">لا يوجد نشاط بعد. ابدأ دورة لتتبع تقدمك!</p>
          ) : (
            <div className="space-y-0">
              {activities.map((activity, i) => {
                const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.lesson_completed;
                const Icon = config.icon;
                const isLast = i === activities.length - 1;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="flex gap-3"
                  >
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-[var(--border)] my-1" />}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 ${isLast ? "pb-0" : "pb-4"}`}>
                      <div className="flex items-center justify-between">
                        <Link href={`/courses/${activity.courseId}`} className="group">
                          <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                            {activity.title}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">{activity.subtitle}</p>
                        </Link>
                        <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 shrink-0 mr-3">
                          <Clock className="h-3 w-3" /> {timeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

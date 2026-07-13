"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, Brain, Clock } from "lucide-react";
import type { EnrolledCourse } from "./types";

export function LearningProgress({ courses, totalCompleted, totalLessons, quizzesPassed, totalQuizzes }: {
  courses: EnrolledCourse[];
  totalCompleted: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
}) {
  const totalEnrolled = courses.length;
  const completedCourses = courses.filter((c) => c.progressPercent === 100).length;
  const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const metrics = [
    { label: "نسبة إكمال المنصة", value: overallPercent, icon: BookOpen, color: "text-[var(--primary)]" },
    { label: "الدروس المكتملة", value: totalCompleted, max: totalLessons, icon: CheckCircle, color: "text-green-400" },
    { label: "الاختبارات المكتملة", value: quizzesPassed, max: totalQuizzes, icon: Brain, color: "text-purple-400" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">تقدم التعلم</h2>
      <Card className="border-[var(--border)] bg-[var(--card)]">
        <CardContent className="p-6">
          {/* Overall */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted-foreground)]">التقدم الكلي</span>
              <span className="text-sm font-bold text-[var(--foreground)]">{overallPercent}%</span>
            </div>
            <Progress value={overallPercent} className="h-3" />
            <div className="flex items-center justify-between mt-2 text-xs text-[var(--muted-foreground)]">
              <span>{totalCompleted} من {totalLessons} درس مكتمل</span>
              <span>{completedCourses} من {totalEnrolled} دورة مكتملة</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {metrics.map((m) => (
              <div key={m.label} className="p-3 rounded-lg bg-[var(--secondary)]/50">
                <div className="flex items-center gap-2 mb-2">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-xs text-[var(--muted-foreground)]">{m.label}</span>
                </div>
                <p className="text-lg font-bold text-[var(--foreground)]">
                  {m.value}{m.max !== undefined ? <span className="text-sm font-normal text-[var(--muted-foreground)]"> / {m.max}</span> : "%"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Clock } from "lucide-react";
import type { EnrolledCourse } from "./types";
import { DIFF_MAP, DIFF_COLORS } from "./types";

export function ContinueLearning({ course }: { course: EnrolledCourse | null }) {
  if (!course) {
    return (
      <Card className="border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <CardContent className="p-8 text-center">
          <p className="text-[var(--muted-foreground)] mb-4">لم تبدأ أي دورة بعد</p>
          <Link href="/courses">
            <Button className="bg-[var(--primary)] text-[var(--primary-foreground)]">استكشف الدورات</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Link href={course.currentLesson ? `/courses/${course.id}/lesson/${course.currentLesson.id}` : `/courses/${course.id}`}>
        <Card className="border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-[var(--primary)]/50 transition-all hover:shadow-lg hover:shadow-[var(--primary)]/5 cursor-pointer group">
          <div className="flex flex-col md:flex-row">
            {/* Thumbnail */}
            <div className="relative w-full md:w-80 h-48 md:h-auto shrink-0 overflow-hidden">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card)] flex items-center justify-center min-h-[192px]">
                  <Play className="h-12 w-12 text-[var(--primary)]/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
              <div className="absolute bottom-3 right-3 md:hidden">
                <Badge variant="success" className="text-xs">آخر درس</Badge>
              </div>
            </div>

            {/* Content */}
            <CardContent className="flex-1 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                <Badge variant="outline" className={`text-xs ${DIFF_COLORS[course.difficulty] || ""}`}>{DIFF_MAP[course.difficulty]}</Badge>
                <Badge variant="success" className="text-xs hidden md:inline-flex">آخر درس</Badge>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                {course.title}
              </h2>

              {course.currentLesson && (
                <div className="mb-4">
                  <p className="text-sm text-[var(--muted-foreground)]">الدرس الحالي</p>
                  <p className="text-base font-medium text-[var(--foreground)]">{course.currentLesson.title}</p>
                </div>
              )}

              <div className="flex items-center gap-4 mb-4 text-sm text-[var(--muted-foreground)]">
                <span>الدرس {course.currentLesson?.order || 0} من {course.totalLessons}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">التقدم</span>
                  <span className="font-medium text-[var(--foreground)]">{course.progressPercent}%</span>
                </div>
                <Progress value={course.progressPercent} className="h-2" />
              </div>

              <div className="mt-4">
                <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] group-hover:bg-[var(--primary)]/90 transition-colors">
                  <Play className="ml-2 h-4 w-4" /> متابعة التعلم <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

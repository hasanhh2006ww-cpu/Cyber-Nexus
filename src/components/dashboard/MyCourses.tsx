"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, BarChart } from "lucide-react";
import type { EnrolledCourse } from "./types";
import { DIFF_MAP, DIFF_COLORS } from "./types";

function getCourseStatus(course: EnrolledCourse): { label: string; variant: string } {
  if (course.progressPercent === 100) return { label: "مكتمل", variant: "success" };
  if (course.completedLessons === 0) return { label: "جديد", variant: "secondary" };
  return { label: "قيد التنفيذ", variant: "warning" };
}

export function MyCourses({ courses }: { courses: EnrolledCourse[] }) {
  if (courses.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">دوراتي</h2>
        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardContent className="py-12 text-center">
            <p className="text-[var(--muted-foreground)] mb-4">لم تسجل في أي دورة بعد</p>
            <Link href="/courses">
              <Button className="bg-[var(--primary)] text-[var(--primary-foreground)]">استكشف الدورات</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[var(--foreground)]">دوراتي ({courses.length})</h2>
        {courses.length > 4 && (
          <Link href="/courses" className="text-sm text-[var(--primary)] hover:underline">عرض الكل</Link>
        )}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courses.map((course, i) => {
          const status = getCourseStatus(course);
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link href={`/courses/${course.id}`}>
                <Card className="h-full border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 transition-all hover:shadow-md cursor-pointer group overflow-hidden">
                  <div className="relative h-36 overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/15 to-[var(--card)] flex items-center justify-center">
                        <BarChart className="h-10 w-10 text-[var(--primary)]/30" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <Badge className={`text-xs ${DIFF_COLORS[course.difficulty] || ""}`}>{DIFF_MAP[course.difficulty]}</Badge>
                      <Badge variant={status.variant as "success" | "warning" | "secondary"} className="text-xs">{status.label}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-[var(--foreground)] mb-1 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] mb-3">{course.totalLessons} درس &middot; {course.category}</p>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--muted-foreground)]">{course.completedLessons}/{course.totalLessons} درس مكتمل</span>
                        <span className="font-medium text-[var(--foreground)]">{course.progressPercent}%</span>
                      </div>
                      <Progress value={course.progressPercent} className="h-1.5" />
                    </div>

                    <Button size="sm" className="w-full bg-[var(--primary)] text-[var(--primary-foreground)]">
                      <Play className="ml-1 h-3 w-3" /> متابعة
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

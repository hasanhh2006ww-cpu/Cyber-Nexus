"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, BarChart, ArrowLeft } from "lucide-react";
import { DIFF_MAP, DIFF_COLORS } from "./types";

interface RecommendedCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
  difficulty: string;
  duration: string;
  instructorName: string;
  isFree: boolean;
  tags: string;
  _count?: { lessons: number };
}

export function RecommendedCourses({ courses }: { courses: RecommendedCourse[] }) {
  if (courses.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[var(--foreground)]">دورات مقترحة</h2>
        <Link href="/courses" className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1">
          عرض الكل <ArrowLeft className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
          >
            <Link href={`/courses/${course.id}`}>
              <Card className="h-full border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 transition-all hover:shadow-md cursor-pointer group overflow-hidden">
                <div className="relative h-36 overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/15 to-[var(--card)] flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-[var(--primary)]/30" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <Badge variant="secondary" className="text-xs bg-black/50 backdrop-blur-sm">{course.category}</Badge>
                    <Badge className={`text-xs bg-black/50 backdrop-blur-sm ${DIFF_COLORS[course.difficulty] || ""}`}>{DIFF_MAP[course.difficulty]}</Badge>
                  </div>
                  {course.isFree && <Badge variant="success" className="absolute bottom-2 right-2 text-xs">مجانية</Badge>}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-[var(--foreground)] mb-1 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                    <span>{course._count?.lessons || 0} درس</span>
                    <span>{course.duration}</span>
                    {course.instructorName && <span>{course.instructorName}</span>}
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-3 border-[var(--border)]">
                    تسجيل
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

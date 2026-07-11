"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  BarChart,
  Search,
  Filter,
  Shield,
  Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

interface CourseCard {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  banner: string | null;
  category: string;
  difficulty: string;
  duration: string;
  instructorName: string;
  isFree: boolean;
  tags: string;
  _count?: { lessons: number };
}

const DIFF_MAP: Record<string, string> = {
  beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم",
};
const DIFF_COLORS: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || course.difficulty === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">الدورات</h1>
              <p className="text-[var(--muted-foreground)]">
                تصفح دوراتنا في الأمن السيبراني وابدأ التعلم
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="بحث في الدورات..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["all", "beginner", "intermediate", "advanced"].map((level) => (
                  <Button
                    key={level}
                    variant={filter === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(level)}
                  >
                    {level === "all" ? "الكل" : DIFF_MAP[level]}
                  </Button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-[var(--secondary)] rounded-[var(--radius)] animate-pulse" />
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, i) => {
                  let tags: string[] = [];
                  try { tags = JSON.parse(course.tags || "[]"); } catch { /* ignore */ }
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <Link href={`/courses/${course.id}`}>
                        <Card className="h-full border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 transition-all hover:shadow-lg hover:shadow-[var(--primary)]/5 group cursor-pointer overflow-hidden">
                          <div className="relative h-40 overflow-hidden">
                            {course.thumbnail ? (
                              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--card)] flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-[var(--primary)]/40" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2">
                              <Badge className={`capitalize ${DIFF_COLORS[course.difficulty] || ""}`}>
                                {DIFF_MAP[course.difficulty] || course.difficulty}
                              </Badge>
                              {course.isFree ? (
                                <Badge variant="success">مجانية</Badge>
                              ) : null}
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{course.category}</Badge>
                              {course.instructorName && (
                                <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Shield className="h-3 w-3" /> {course.instructorName}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                              {course.title}
                            </h3>
                            <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {course.duration}
                              </div>
                              <div className="flex items-center gap-1">
                                <BarChart className="h-3 w-3" /> {course._count?.lessons || 0} درس
                              </div>
                            </div>
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                                {tags.length > 3 && <Badge variant="outline" className="text-xs">+{tags.length - 3}</Badge>}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Filter className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                <p className="text-[var(--muted-foreground)]">لا توجد دورات تطابق معاييرك.</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

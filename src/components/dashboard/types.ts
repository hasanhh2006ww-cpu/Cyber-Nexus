import { BookOpen, CheckCircle, Clock, Trophy, Flame, Timer, FileText, Brain, Star, Target, Zap, Medal, GraduationCap } from "lucide-react";

export interface EnrolledCourse {
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
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  currentLesson: { id: string; title: string; order: number } | null;
  lastAccessed: string | null;
}

export interface DashboardStats {
  streak: number;
  studyHours: number;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  averageScore: number;
}

export interface ActivityItem {
  id: string;
  type: "lesson_completed" | "quiz_passed" | "quiz_failed" | "course_started" | "chapter_finished";
  title: string;
  subtitle: string;
  timestamp: string;
  courseId: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Star;
  unlocked: boolean;
  unlockedAt?: string;
}

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "unlocked" | "unlockedAt">[] = [
  { id: "first_course", title: "الدورة الأولى", description: "سجل في أول دورة", icon: GraduationCap },
  { id: "first_lesson", title: "الخطوة الأولى", description: "أكمل أول درس", icon: Target },
  { id: "five_lessons", title: "متعلم نشط", description: "أكمل 5 دروس", icon: BookOpen },
  { id: "ten_lessons", title: "طالب مجتهد", description: "أكمل 10 دروس", icon: Medal },
  { id: "quiz_master", title: "عبقري الاختبارات", description: "اجتز 5 اختبارات", icon: Brain },
  { id: "streak_3", title: "متعلم مستمر", description: "3 أيام متتالية", icon: Flame },
  { id: "streak_7", title: "أسبوع كامل", description: "7 أيام متتالية", icon: Zap },
  { id: "perfect_score", title: "نتيجة مثالية", description: "100% في اختبار", icon: Trophy },
  { id: "all_courses", title: "جامع الدورات", description: "سجل في كل الدورات", icon: Star },
  { id: "quiz_10", title: "خبير الاختبارات", description: "اجتز 10 اختبارات", icon: Brain },
];

export const ACTIVITY_ICONS: Record<string, typeof BookOpen> = {
  lesson_completed: CheckCircle,
  quiz_passed: Trophy,
  quiz_failed: FileText,
  course_started: BookOpen,
  chapter_finished: Star,
};

export const DIFF_MAP: Record<string, string> = {
  beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم",
};

export const DIFF_COLORS: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

interface Question {
  id: string;
  text: string;
  options: string;
  correctAnswer: number;
}

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

interface QuizResult {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(
          `/api/courses/${params.id}/lessons/${params.lessonId}/quiz`
        );

        if (!res.ok) {
          router.push(`/courses/${params.id}/lesson/${params.lessonId}`);
          return;
        }

        const data = await res.json();
        setQuiz(data);
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
        router.push(`/courses/${params.id}/lesson/${params.lessonId}`);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [params.id, params.lessonId, router]);

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);

    try {
      const answersArray = Object.entries(answers).map(
        ([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })
      );

      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: answersArray,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setSubmitted(false);
    setResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
              <div className="h-8 w-48 bg-[var(--secondary)] rounded" />
              <div className="h-64 bg-[var(--secondary)] rounded-[var(--radius)]" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  if (submitted && result) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-[var(--border)] bg-[var(--card)]">
                <CardContent className="p-8 text-center">
                  <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                    result.passed
                      ? "bg-[var(--success)]/10"
                      : "bg-[var(--destructive)]/10"
                  }`}>
                    {result.passed ? (
                      <Trophy className="h-10 w-10 text-[var(--success)]" />
                    ) : (
                      <XCircle className="h-10 w-10 text-[var(--destructive)]" />
                    )}
                  </div>

                  <h1 className="text-2xl font-bold mb-2">
                    {result.passed ? "تهانينا!" : "حاول مرة أخرى!"}
                  </h1>
                  <p className="text-[var(--muted-foreground)] mb-8">
                    {result.passed
                      ? "لقد اجتزت الاختبار! عمل رائع!"
                      : "لم تجتز الاختبار هذه المرة. راجع المادة وحاول مرة أخرى."}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-[var(--radius)] bg-[var(--secondary)]/50">
                      <p className="text-2xl font-bold text-[var(--primary)]">
                        {result.score}%
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">النتيجة</p>
                    </div>
                    <div className="p-4 rounded-[var(--radius)] bg-[var(--secondary)]/50">
                      <p className="text-2xl font-bold text-[var(--success)]">
                        {result.correct}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">صحيحة</p>
                    </div>
                    <div className="p-4 rounded-[var(--radius)] bg-[var(--secondary)]/50">
                      <p className="text-2xl font-bold">{result.total}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">المجموع</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={resetQuiz} variant="outline" className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      إعادة الاختبار
                    </Button>
                    <Link
                      href={`/courses/${params.id}/lesson/${params.lessonId}`}
                    >
                      <Button className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
              العودة للدرس
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const parsedOptions: string[] = JSON.parse(question.options);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === quiz.questions.length;

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
            className="max-w-3xl mx-auto"
          >
            {/* Back link */}
            <Link
              href={`/courses/${params.id}/lesson/${params.lessonId}`}
              className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
                        العودة للدرس
            </Link>

            {/* Quiz Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
              <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                <span>
                  السؤال {currentQuestion + 1} من {quiz.questions.length}
                </span>
                <span>|</span>
                <span>
                  {answeredCount}/{quiz.questions.length} مجاب عليه
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-[var(--secondary)] mb-8">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mb-8 border-[var(--border)] bg-[var(--card)]">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-6">
                      {question.text}
                    </h2>

                    <div className="space-y-3">
                      {parsedOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswer(question.id, index)}
                          className={`w-full text-left p-4 rounded-[var(--radius)] border transition-all ${
                            answers[question.id] === index
                              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                              : "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--accent)]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                              answers[question.id] === index
                                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                : "border-[var(--border)]"
                            }`}>
                              <span className="text-sm font-medium">
                                {String.fromCharCode(65 + index)}
                              </span>
                            </div>
                            <span>{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestion((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestion === 0}
              >
                السابق
              </Button>

              <div className="flex gap-2">
                {quiz.questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i === currentQuestion
                        ? "bg-[var(--primary)] w-6"
                        : answers[quiz.questions[i].id] !== undefined
                        ? "bg-[var(--success)]"
                        : "bg-[var(--secondary)]"
                    }`}
                  />
                ))}
              </div>

              {currentQuestion < quiz.questions.length - 1 ? (
                <Button
                  onClick={() =>
                    setCurrentQuestion((prev) =>
                      Math.min(quiz.questions.length - 1, prev + 1)
                    )
                  }
                >
                  التالي
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                >
                  {submitting ? "جارٍ الإرسال..." : "إرسال الاختبار"}
                </Button>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

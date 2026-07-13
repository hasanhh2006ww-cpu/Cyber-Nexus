"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import type { Achievement } from "./types";

export function Achievements({ achievements }: { achievements: Achievement[] }) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[var(--foreground)]">الإنجازات</h2>
        <span className="text-sm text-[var(--muted-foreground)]">{unlockedCount}/{achievements.length}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {achievements.map((achievement, i) => {
          const Icon = achievement.icon;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className={`border-[var(--border)] ${achievement.unlocked ? "bg-[var(--card)]" : "bg-[var(--card)] opacity-50"}`}>
                <CardContent className="p-4 text-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full mx-auto mb-2 ${
                    achievement.unlocked ? "bg-[var(--primary)]/10" : "bg-[var(--secondary)]"
                  }`}>
                    {achievement.unlocked ? (
                      <Icon className="h-6 w-6 text-[var(--primary)]" />
                    ) : (
                      <Lock className="h-6 w-6 text-[var(--muted-foreground)]" />
                    )}
                  </div>
                  <p className={`text-sm font-medium ${achievement.unlocked ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                    {achievement.title}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{achievement.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

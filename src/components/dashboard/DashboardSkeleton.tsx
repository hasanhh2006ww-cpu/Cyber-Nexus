"use client";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <main className="flex-1 p-6 lg:p-8">
          <div className="animate-pulse space-y-8">
            {/* Welcome skeleton */}
            <div className="h-10 w-64 bg-[var(--secondary)] rounded" />

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-[var(--secondary)] rounded-[var(--radius)]" />
              ))}
            </div>

            {/* Continue Learning skeleton */}
            <div className="h-56 bg-[var(--secondary)] rounded-[var(--radius)]" />

            {/* Courses grid skeleton */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 bg-[var(--secondary)] rounded-[var(--radius)]" />
              ))}
            </div>

            {/* Two column skeleton */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="h-64 bg-[var(--secondary)] rounded-[var(--radius)]" />
              <div className="h-64 bg-[var(--secondary)] rounded-[var(--radius)]" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { CheckCircle, Clock, Target, TrendingUp } from "lucide-react";
import clsx from "clsx";

type Stat = {
  number: string;
  label: string;
  icon: typeof Target;
  colorClass: string;
};

export function DashboardStats({
  totalProjects,
  completedProjects,
  inProgressProjects,
}: {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
}) {
  const stats: Stat[] = [
    {
      number: String(totalProjects),
      label: "Total projects",
      icon: Target,
      colorClass: "text-sky-400",
    },
    {
      number: String(completedProjects),
      label: "Completed",
      icon: CheckCircle,
      colorClass: "text-emerald-400",
    },
    {
      number: String(inProgressProjects),
      label: "In progress",
      icon: Clock,
      colorClass: "text-amber-400",
    },
    {
      number: "95%",
      label: "Avg. satisfaction",
      icon: TrendingUp,
      colorClass: "text-violet-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-5 transition-shadow hover:shadow-lg"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-3xl font-bold text-[var(--color-text)]">
                {stat.number}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {stat.label}
              </p>
            </div>
            <stat.icon
              className={clsx("h-8 w-8 shrink-0", stat.colorClass)}
              aria-hidden
            />
          </div>
        </div>
      ))}
    </div>
  );
}

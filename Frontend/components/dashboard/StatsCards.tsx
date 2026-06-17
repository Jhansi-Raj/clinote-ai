"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { listRuns, type RunListItem } from "@/lib/api";
import { cn } from "@/lib/utils";

interface StatCardData {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  color: "teal" | "amber" | "rose" | "indigo";
}

const colorMap: Record<StatCardData["color"], { bg: string; icon: string; trend: string }> = {
  teal: { bg: "bg-teal-50", icon: "text-teal-600", trend: "text-teal-600" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", trend: "text-amber-600" },
  rose: { bg: "bg-rose-50", icon: "text-rose-600", trend: "text-rose-600" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", trend: "text-indigo-600" },
};

function buildStats(runs: RunListItem[]): StatCardData[] {
  const total = runs.length;
  const completed = runs.filter((r) => r.status === "completed").length;
  const processing = runs.filter(
    (r) => r.status === "processing" || r.status === "pending",
  ).length;
  const failed = runs.filter((r) => r.status === "failed").length;

  return [
    {
      id: "total",
      label: "Total Runs",
      value: String(total),
      detail: total === 0 ? "No runs yet" : `${total} on record`,
      icon: BarChart3,
      color: "teal",
    },
    {
      id: "completed",
      label: "Completed",
      value: String(completed),
      detail: total > 0 ? `${Math.round((completed / total) * 100)}% of total` : "—",
      icon: CheckCircle2,
      color: "indigo",
    },
    {
      id: "processing",
      label: "In Progress",
      value: String(processing),
      detail: processing > 0 ? "Analyses running now" : "Idle",
      icon: Loader2,
      color: "amber",
    },
    {
      id: "failed",
      label: "Failed",
      value: String(failed),
      detail: failed > 0 ? "Review errors" : "All clear",
      icon: AlertCircle,
      color: "rose",
    },
  ];
}

export default function StatsCards() {
  const [runs, setRuns] = useState<RunListItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listRuns(100)
      .then((data) => {
        if (!cancelled) setRuns(data);
      })
      .catch(() => {
        if (!cancelled) setRuns([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = buildStats(runs ?? []);
  const isLoading = runs === null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((card, i) => {
        const Icon = card.icon;
        const colors = colorMap[card.color];
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="bg-white rounded-xl border border-slate-200 shadow-card p-5 hover:shadow-card-hover transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  colors.bg,
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    colors.icon,
                    card.id === "processing" && (runs?.some((r) => r.status === "processing") ?? false) && "animate-spin",
                  )}
                />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              {isLoading ? "—" : card.value}
            </p>
            <p className="text-sm font-medium text-slate-600 mb-2">{card.label}</p>
            <p className={cn("text-xs font-medium", colors.trend)}>
              {isLoading ? "Loading…" : card.detail}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

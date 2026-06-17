"use client";

import { cn } from "@/lib/utils";
import type { BadgeVariant } from "@/types";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  missing: "bg-rose-50 text-rose-700 border-rose-200",
  conflict: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  escalation: "bg-red-50 text-red-700 border-red-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  failed: "bg-rose-100 text-rose-800 border-rose-300",
  added: "bg-emerald-50 text-emerald-700 border-emerald-200",
  stopped: "bg-rose-50 text-rose-700 border-rose-200",
  changed: "bg-amber-50 text-amber-700 border-amber-200",
  unchanged: "bg-slate-100 text-slate-600 border-slate-200",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export default function Badge({ variant = "default", children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "missing" || variant === "failed" || variant === "stopped"
              ? "bg-rose-500"
              : variant === "conflict" || variant === "changed"
              ? "bg-amber-500"
              : variant === "pending" || variant === "processing"
              ? "bg-blue-500"
              : variant === "escalation"
              ? "bg-red-500"
              : variant === "success" || variant === "added"
              ? "bg-emerald-500"
              : "bg-slate-400"
          )}
        />
      )}
      {children}
    </span>
  );
}

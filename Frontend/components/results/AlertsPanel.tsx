"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  ShieldAlert,
  XCircle,
  ChevronDown,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { AlertType } from "@/types";
import type { BackendWarning } from "@/lib/api";

interface AlertsPanelProps {
  warnings: BackendWarning[];
}

type FilterTab = "all" | AlertType;

const tabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "missing", label: "Missing" },
  { id: "conflict", label: "Conflicts" },
  { id: "pending", label: "Pending" },
  { id: "escalation", label: "Escalations" },
];

const alertIcons: Record<AlertType, React.ElementType> = {
  missing: XCircle,
  conflict: AlertTriangle,
  pending: Clock,
  escalation: ShieldAlert,
};

const alertSeverityBar: Record<string, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-400",
  low: "bg-blue-400",
};

const alertTypeBadge: Record<AlertType, "missing" | "conflict" | "pending" | "escalation"> = {
  missing: "missing",
  conflict: "conflict",
  pending: "pending",
  escalation: "escalation",
};

export default function AlertsPanel({ warnings }: AlertsPanelProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Stable id per warning since the backend doesn't supply one.
  const idFor = (w: BackendWarning, idx: number) => `${w.type}-${w.field}-${idx}`;

  const filtered = warnings
    .map((w, idx) => ({ ...w, _id: idFor(w, idx) }))
    .filter((a) => activeTab === "all" || a.type === activeTab);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">Review Required</h2>
          <span
            className={cn(
              "inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold",
              warnings.length > 0 ? "bg-rose-500" : "bg-emerald-500",
            )}
          >
            {warnings.length}
          </span>
        </div>
      </div>

      <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1 flex-shrink-0">
        {tabs.map((tab) => {
          const count =
            tab.id === "all"
              ? warnings.length
              : warnings.filter((a) => a.type === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg transition-all duration-150",
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={cn(
                    "ml-1 text-[10px] px-1 py-0.5 rounded-full font-bold",
                    activeTab === tab.id
                      ? "bg-slate-100 text-slate-600"
                      : "text-slate-400",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
        <AnimatePresence mode="popLayout">
          {filtered.map((alert) => {
            const Icon = alertIcons[alert.type] ?? AlertCircle;
            const isOpen = expanded.has(alert._id);
            const isEscalation = alert.type === "escalation";

            return (
              <motion.div
                key={alert._id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  "rounded-xl border overflow-hidden",
                  isEscalation
                    ? "border-rose-300 bg-rose-50/60"
                    : "bg-white border-slate-200 shadow-card",
                )}
              >
                <button
                  onClick={() => toggle(alert._id)}
                  className="w-full flex items-start gap-0 text-left"
                >
                  <div
                    className={cn(
                      "w-1 self-stretch rounded-l-xl flex-shrink-0",
                      alertSeverityBar[alert.severity] ?? "bg-slate-300",
                    )}
                  />

                  <div className="flex-1 px-4 py-3.5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            isEscalation
                              ? "text-rose-600"
                              : alert.type === "conflict"
                              ? "text-amber-500"
                              : alert.type === "missing"
                              ? "text-rose-500"
                              : "text-blue-500",
                          )}
                        />
                        <Badge variant={alertTypeBadge[alert.type] ?? "default"}>
                          {alert.type}
                        </Badge>
                        {alert.severity === "high" && <Badge variant="missing">HIGH</Badge>}
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </div>

                    <p className="text-sm font-semibold text-slate-800 mt-2">{alert.field}</p>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            {alert.message}
                          </p>

                          {alert.sources && alert.sources.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {alert.sources.map((src, i) => (
                                <div
                                  key={`${src.label}-${i}`}
                                  className="bg-slate-900 rounded-lg px-3 py-2"
                                >
                                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
                                    {src.label}
                                  </p>
                                  <p className="text-xs text-teal-300 font-mono">{src.value}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {(isEscalation || alert.requires_decision) && (
                            <div className="mt-3 flex items-center gap-2 bg-rose-100 rounded-lg px-3 py-2.5">
                              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                              <p className="text-xs font-semibold text-rose-700">
                                Requires Clinician Decision — cannot be auto-resolved
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-8 h-8 text-slate-200 mb-2" />
            <p className="text-sm text-slate-400">
              {warnings.length === 0
                ? "No alerts. The agent didn't flag anything."
                : "No alerts in this category"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

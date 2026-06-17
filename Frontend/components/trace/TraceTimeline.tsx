"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Terminal,
  Brain,
  Zap,
  Hash,
} from "lucide-react";
import { traceSteps } from "@/lib/mockData";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";

const resultTypeStyles = {
  success: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  warning: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  error: { dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
  info: { dot: "bg-blue-400", text: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
};

const stepStatusStyles = {
  completed: {
    circle: "bg-teal-600 border-teal-600",
    line: "bg-teal-200",
    icon: <CheckCircle className="w-4 h-4 text-white" />,
  },
  active: {
    circle: "bg-white border-teal-500 border-2",
    line: "bg-slate-200",
    icon: null,
  },
  error: {
    circle: "bg-rose-500 border-rose-500",
    line: "bg-rose-200",
    icon: <XCircle className="w-4 h-4 text-white" />,
  },
  skipped: {
    circle: "bg-slate-200 border-slate-200",
    line: "bg-slate-100",
    icon: null,
  },
};

const phaseColors: Record<string, string> = {
  Initialize: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Parse Documents": "bg-teal-50 text-teal-700 border-teal-200",
  "Extract Demographics": "bg-slate-100 text-slate-700 border-slate-200",
  "Extract Dates & Diagnoses": "bg-amber-50 text-amber-700 border-amber-200",
  "Medication Reconciliation": "bg-purple-50 text-purple-700 border-purple-200",
  "Drug Interaction Check": "bg-rose-50 text-rose-700 border-rose-200",
  "Pending Items Check": "bg-blue-50 text-blue-700 border-blue-200",
  "Finalize Draft": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function TraceTimeline() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["TS-06"]));

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="space-y-2">
      {traceSteps.map((step, i) => {
        const isOpen = expanded.has(step.id);
        const styles = stepStatusStyles[step.status];
        const resultStyles = resultTypeStyles[step.resultType ?? "info"];

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="flex gap-4"
          >
            {/* Left: timeline */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center z-10 border",
                  styles.circle
                )}
              >
                {styles.icon ?? (
                  <span className="text-xs font-bold text-slate-400">{step.stepNumber}</span>
                )}
              </div>
              {i < traceSteps.length - 1 && (
                <div className={cn("w-px flex-1 my-1 min-h-[16px]", styles.line)} />
              )}
            </div>

            {/* Right: card */}
            <div className="flex-1 pb-4">
              <div
                className={cn(
                  "bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden"
                )}
              >
                {/* Card header */}
                <button
                  onClick={() => toggle(step.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full border",
                        phaseColors[step.phase] ?? "bg-slate-100 text-slate-600 border-slate-200"
                      )}
                    >
                      {step.phase}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {formatDateTime(step.timestamp)}
                    </span>
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        resultStyles.dot
                      )}
                    />
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-slate-400 flex-shrink-0 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 divide-y divide-slate-50">
                        {/* Reasoning */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              Reasoning
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 italic leading-relaxed bg-slate-50 rounded-lg px-3 py-2.5">
                            {step.reasoning}
                          </p>
                        </div>

                        {/* Action + Inputs */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-3.5 h-3.5 text-teal-500" />
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              Action
                            </span>
                            <Badge variant="default">
                              <Terminal className="w-2.5 h-2.5 mr-1" />
                              {step.action}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(step.inputs).map(([k, v]) => (
                              <div
                                key={k}
                                className="bg-slate-900 rounded-lg px-3 py-1.5 flex items-center gap-2"
                              >
                                <Hash className="w-2.5 h-2.5 text-slate-500" />
                                <span className="text-[10px] text-slate-400 font-mono">{k}</span>
                                <span className="text-[10px] text-teal-300 font-mono max-w-[180px] truncate">
                                  {v}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Result */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              Result
                            </span>
                          </div>
                          <div
                            className={cn(
                              "rounded-lg px-3 py-2.5 border text-sm",
                              resultStyles.bg,
                              resultStyles.text
                            )}
                          >
                            {step.result}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

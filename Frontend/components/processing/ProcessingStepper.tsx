"use client";

import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BackendTraceStep } from "@/lib/api";

interface ProcessingStepperProps {
  status: "pending" | "processing" | "completed" | "failed";
  trace: BackendTraceStep[];
  stepCount: number;
}

interface PhaseDef {
  id: string;
  label: string;
  detail: string;
  match: (phase: string) => boolean;
}

const PHASES: PhaseDef[] = [
  {
    id: "read",
    label: "Reading Documents",
    detail: "Parsing and extracting text from uploaded PDFs",
    match: (p) => /parse|read|pdf|document/i.test(p),
  },
  {
    id: "extract",
    label: "Extracting Facts",
    detail: "Identifying clinical entities, dates, medications, and diagnoses",
    match: (p) => /extract|fact|demograph|date|diagnos|medication/i.test(p),
  },
  {
    id: "check",
    label: "Checking Conflicts",
    detail: "Cross-referencing values across documents and calling safety tools",
    match: (p) => /conflict|missing|interaction|escalat|pending|drug/i.test(p),
  },
  {
    id: "finalize",
    label: "Finalizing Draft",
    detail: "Assembling structured summary with all flags and missing field markers",
    match: (p) => /finalize|summary|generate|draft/i.test(p),
  },
];

function computePhaseStatus(
  phase: PhaseDef,
  trace: BackendTraceStep[],
  runStatus: ProcessingStepperProps["status"],
): "completed" | "active" | "pending" | "error" {
  const matched = trace.filter((t) => phase.match(t.phase));
  if (!matched.length) {
    // No trace for this phase yet. Find the first phase with no trace and mark
    // it active when run is processing.
    return "pending";
  }
  const last = matched[matched.length - 1];
  if (last.status === "error") return "error";
  // Phase is "active" if it's the most recent phase being executed and the
  // run hasn't moved on to a later phase yet.
  const idx = PHASES.findIndex((p) => p.id === phase.id);
  const laterPhaseStarted = trace.some((t) =>
    PHASES.slice(idx + 1).some((later) => later.match(t.phase)),
  );
  if (laterPhaseStarted) return "completed";
  if (runStatus === "completed") return "completed";
  if (runStatus === "failed") return "error";
  return "active";
}

export default function ProcessingStepper({
  status,
  trace,
  stepCount,
}: ProcessingStepperProps) {
  const phaseStatuses = PHASES.map((p) => ({
    ...p,
    status: computePhaseStatus(p, trace, status),
  }));

  // If nothing matches yet but the run is processing, mark the first phase active.
  if (
    status === "processing" &&
    phaseStatuses.every((p) => p.status === "pending")
  ) {
    phaseStatuses[0].status = "active";
  }

  const completed = phaseStatuses.filter((p) => p.status === "completed").length;
  const total = phaseStatuses.length;
  const progress =
    status === "completed"
      ? 100
      : Math.min(95, ((completed + (status === "processing" ? 0.5 : 0)) / total) * 100);

  const recentTrace = trace.slice(-5);

  return (
    <div className="max-w-xl w-full mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">
            {status === "completed"
              ? "Analysis complete"
              : status === "failed"
              ? "Analysis failed"
              : `Step ${Math.min(completed + 1, total)} of ${total}`}
            {stepCount > 0 && (
              <span className="text-xs text-slate-400 ml-2">· agent step {stepCount}</span>
            )}
          </span>
          <span className="text-sm font-semibold text-teal-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              status === "failed"
                ? "bg-gradient-to-r from-rose-500 to-rose-400"
                : "bg-gradient-to-r from-teal-500 to-indigo-500",
            )}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-1 mb-8">
        {phaseStatuses.map((step, i) => {
          const isCompleted = step.status === "completed";
          const isActive = step.status === "active";
          const isError = step.status === "error";

          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                    isCompleted && "bg-teal-600",
                    isActive && "bg-white border-2 border-teal-500",
                    isError && "bg-rose-500",
                    !isCompleted && !isActive && !isError && "bg-slate-100 border-2 border-slate-200",
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-teal-500"
                    />
                  ) : isError ? (
                    <AlertCircle className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-xs font-bold text-slate-400">{i + 1}</span>
                  )}
                </div>
                {i < phaseStatuses.length - 1 && (
                  <div
                    className="w-px flex-1 my-1 min-h-[24px]"
                    style={{ background: isCompleted ? "#99f6e4" : "#f1f5f9" }}
                  />
                )}
              </div>

              <div
                className={cn(
                  "flex-1 pb-6",
                  i === phaseStatuses.length - 1 && "pb-0",
                )}
              >
                <div
                  className={cn(
                    "rounded-xl p-4 border transition-all",
                    isActive
                      ? "bg-white border-teal-200 shadow-md"
                      : isCompleted
                      ? "bg-slate-50 border-slate-100"
                      : isError
                      ? "bg-rose-50 border-rose-200"
                      : "bg-slate-50/50 border-slate-100 opacity-50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isActive ? "text-teal-700" : isCompleted ? "text-slate-800" : isError ? "text-rose-700" : "text-slate-400",
                      )}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="text-[10px] font-bold text-teal-600 uppercase tracking-wider"
                      >
                        Running
                      </motion.span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        Done
                      </span>
                    )}
                    {isError && (
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                        Error
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isActive ? "text-slate-600" : "text-slate-400",
                    )}
                  >
                    {step.detail}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live agent log */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-500 text-xs ml-2 font-mono">clinote-agent — log</span>
        </div>
        <div className="space-y-1.5 font-mono text-xs">
          {recentTrace.length === 0 ? (
            <p className="text-slate-500">→ Waiting for agent to start…</p>
          ) : (
            recentTrace.map((t, i) => (
              <motion.p
                key={`${t.step_number}-${i}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  t.result_type === "error"
                    ? "text-rose-400"
                    : t.result_type === "warning"
                    ? "text-amber-300"
                    : t.result_type === "success"
                    ? "text-emerald-400"
                    : i === recentTrace.length - 1
                    ? "text-teal-400"
                    : "text-slate-400",
                )}
              >
                → [{t.phase}] {t.action}: {t.result}
              </motion.p>
            ))
          )}
          {(status === "pending" || status === "processing") && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-teal-400 ml-1"
            />
          )}
        </div>
      </div>
    </div>
  );
}

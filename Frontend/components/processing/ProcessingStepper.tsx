"use client";

import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { processingSteps } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const statusLines = [
  "→ Parsing admission_note_john_doe.pdf",
  "→ Extracting text from progress_note_3.pdf",
  "→ [EXTRACTING] Identifying diagnoses and clinical entities...",
  "→ Found: Principal diagnosis — Acute CHF Exacerbation",
  "→ [RUNNING] Medication reconciliation across 2 lists...",
];

export default function ProcessingStepper() {
  const activeIdx = processingSteps.findIndex((s) => s.status === "active");
  const total = processingSteps.length;
  const completed = processingSteps.filter((s) => s.status === "completed").length;
  const progress = ((completed + 0.5) / total) * 100;

  return (
    <div className="max-w-xl w-full mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">
            Step {completed + 1} of {total}
          </span>
          <span className="text-sm font-semibold text-teal-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-1 mb-8">
        {processingSteps.map((step, i) => {
          const isCompleted = step.status === "completed";
          const isActive = step.status === "active";
          const isError = step.status === "error";

          return (
            <div key={step.id} className="flex gap-4">
              {/* Left: connector + icon */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                    isCompleted && "bg-teal-600",
                    isActive && "bg-white border-2 border-teal-500",
                    isError && "bg-rose-500",
                    !isCompleted && !isActive && !isError && "bg-slate-100 border-2 border-slate-200"
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
                {i < processingSteps.length - 1 && (
                  <div
                    className={cn(
                      "w-px flex-1 my-1 min-h-[24px]",
                      isCompleted ? "bg-teal-200" : "bg-slate-150"
                    )}
                    style={{ background: isCompleted ? "#99f6e4" : "#f1f5f9" }}
                  />
                )}
              </div>

              {/* Right: content */}
              <div
                className={cn(
                  "flex-1 pb-6",
                  i === processingSteps.length - 1 && "pb-0"
                )}
              >
                <div
                  className={cn(
                    "rounded-xl p-4 border transition-all",
                    isActive
                      ? "bg-white border-teal-200 shadow-md"
                      : isCompleted
                      ? "bg-slate-50 border-slate-100"
                      : "bg-slate-50/50 border-slate-100 opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isActive ? "text-teal-700" : isCompleted ? "text-slate-800" : "text-slate-400"
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
                  </div>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isActive ? "text-slate-600" : "text-slate-400"
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

      {/* Terminal output */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-500 text-xs ml-2 font-mono">clinote-agent — log</span>
        </div>
        <div className="space-y-1.5 font-mono text-xs">
          {statusLines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={cn(
                i === statusLines.length - 1
                  ? "text-teal-400"
                  : i >= 2
                  ? "text-slate-400"
                  : "text-slate-500"
              )}
            >
              {line}
            </motion.p>
          ))}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-2 h-4 bg-teal-400 ml-1"
          />
        </div>
      </div>
    </div>
  );
}

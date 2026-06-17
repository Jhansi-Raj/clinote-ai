"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProcessingStepper from "@/components/processing/ProcessingStepper";
import Button from "@/components/ui/Button";
import { ShieldAlert, FileText, AlertCircle } from "lucide-react";
import { analyzeRun, pollRun, type RunResult, ApiError } from "@/lib/api";

function ProcessingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const runId = params.get("runId");

  const [run, setRun] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!runId) {
      setError("Missing run id. Start a new analysis from the Upload page.");
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    const ac = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        // Kick off the analysis. Ignore 409 if it was already started.
        try {
          await analyzeRun(runId);
        } catch (err) {
          if (err instanceof ApiError && err.status === 409) {
            // Already processing/completed — fine, just poll.
          } else {
            throw err;
          }
        }

        const final = await pollRun(
          runId,
          (r) => {
            if (!cancelled) setRun(r);
          },
          { signal: ac.signal },
        );

        if (cancelled) return;

        if (final.status === "completed") {
          router.replace(`/results?runId=${encodeURIComponent(runId)}`);
        } else if (final.status === "failed") {
          setError(final.error || "Analysis failed. Please try again.");
        }
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof ApiError
            ? err.detail || err.message
            : err instanceof Error
            ? err.message
            : "Unexpected error";
        setError(String(msg));
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [runId, router]);

  const status = run?.status ?? "pending";
  const subtitle = runId
    ? `Run ${runId.slice(0, 8)}…`
    : "Awaiting upload";

  return (
    <DashboardLayout title="Processing Analysis" subtitle={subtitle}>
      <div className="max-w-2xl mx-auto">
        {/* Status header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-teal-200 shadow-card p-5 mb-8 flex items-center gap-4"
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            {status !== "completed" && status !== "failed" && (
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-teal-400"
              />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">
              {status === "completed"
                ? "Analysis complete — redirecting…"
                : status === "failed"
                ? "Analysis failed"
                : "Clinote AI is analyzing your documents"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Do not close this window
            </p>
          </div>
          <motion.div
            animate={
              status === "processing" || status === "pending"
                ? { opacity: [1, 0.4, 1] }
                : { opacity: 1 }
            }
            transition={{ duration: 1.2, repeat: Infinity }}
            className={
              status === "failed"
                ? "text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200"
                : status === "completed"
                ? "text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"
                : "text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200"
            }
          >
            {(status || "pending").toUpperCase()}
          </motion.div>
        </motion.div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-800 mb-1">Something went wrong</p>
              <p className="text-sm text-rose-700 break-words">{error}</p>
              <div className="mt-4 flex gap-2">
                <Link href="/upload">
                  <Button variant="primary" size="sm">Start over</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Back to dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <ProcessingStepper
            status={status}
            trace={run?.trace ?? []}
            stepCount={run?.step_count ?? 0}
          />
        )}

        {/* Safety reminder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4"
        >
          <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            The agent will flag any field it cannot source from the provided documents. Missing,
            conflicting, and pending items will be clearly marked. The output is a{" "}
            <span className="font-semibold text-slate-600">draft for clinician review</span> — not a
            finalized clinical document.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Processing Analysis" subtitle="Loading…">
          <div className="max-w-2xl mx-auto py-20 text-center text-sm text-slate-500">
            Loading run…
          </div>
        </DashboardLayout>
      }
    >
      <ProcessingInner />
    </Suspense>
  );
}

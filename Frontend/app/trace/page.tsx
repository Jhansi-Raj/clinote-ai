"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TraceTimeline from "@/components/trace/TraceTimeline";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  Download,
  Calendar,
  FileText,
  Hash,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getRun, type RunResult } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

function TraceInner() {
  const params = useSearchParams();
  const runId = params.get("runId");

  const [run, setRun] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!runId) {
      setError("Missing run id. Pick an analysis from the dashboard.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getRun(runId)
      .then((r) => {
        if (!cancelled) setRun(r);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.detail || err?.message || "Failed to load run");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [runId]);

  if (loading) {
    return (
      <DashboardLayout title="Audit Trail" subtitle="Loading…">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !run) {
    return (
      <DashboardLayout title="Audit Trail" subtitle="Could not load trace">
        <div className="max-w-xl mx-auto rounded-xl border border-rose-200 bg-rose-50 p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-800 mb-1">Unable to load run</p>
            <p className="text-sm text-rose-700">{error}</p>
            <div className="mt-4">
              <Link href="/dashboard">
                <Button variant="primary" size="sm">
                  Back to dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const docsProcessed = run.summary_draft?.metadata?.documents_processed;

  return (
    <DashboardLayout
      title="Audit Trail"
      subtitle="Full step-by-step trace of the AI analysis"
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
          Export Trace
        </Button>
      }
    >
      {/* Trace metadata */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-card">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-slate-400" />
          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
            {run.run_id}
          </span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500">
            {formatDateTime(run.updated_at)}
          </span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500">
            {run.trace.length} step{run.trace.length === 1 ? "" : "s"}
            {typeof docsProcessed === "number" &&
              ` · ${docsProcessed} document${docsProcessed === 1 ? "" : "s"}`}
          </span>
        </div>
        <div className="ml-auto">
          {run.status === "completed" ? (
            <Badge variant="success" dot>
              Trace Complete
            </Badge>
          ) : run.status === "failed" ? (
            <Badge variant="failed" dot>
              Failed
            </Badge>
          ) : (
            <Badge variant="processing" dot>
              {run.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {[
          { color: "bg-teal-500", label: "Completed" },
          { color: "bg-amber-400", label: "Warning / Flag" },
          { color: "bg-rose-500", label: "Error / Escalation" },
          { color: "bg-emerald-500", label: "Success" },
        ].map(({ color, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-xs text-slate-500"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </div>

      <div className="max-w-3xl">
        <TraceTimeline trace={run.trace} />
      </div>
    </DashboardLayout>
  );
}

export default function TracePage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Audit Trail" subtitle="Loading…">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
          </div>
        </DashboardLayout>
      }
    >
      <TraceInner />
    </Suspense>
  );
}

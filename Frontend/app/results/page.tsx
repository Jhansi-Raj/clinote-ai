"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SummaryPanel from "@/components/results/SummaryPanel";
import AlertsPanel from "@/components/results/AlertsPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Download, FileSearch, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { getRun, type RunResult } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

function ResultsInner() {
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
      <DashboardLayout title="Analysis Results" subtitle="Loading…">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !run) {
    return (
      <DashboardLayout title="Analysis Results" subtitle="Could not load results">
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

  const totalFlags =
    run.summary_draft?.metadata?.total_flags ?? run.warnings.length;
  const docsProcessed = run.summary_draft?.metadata?.documents_processed;
  const subtitle = `Run ${run.run_id.slice(0, 8)}… · Review required before finalizing`;

  return (
    <DashboardLayout
      title="Analysis Results"
      subtitle={subtitle}
      actions={
        <div className="flex items-center gap-2">
          <Link href={`/trace?runId=${encodeURIComponent(run.run_id)}`}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileSearch className="w-3.5 h-3.5" />}
            >
              View Trace
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Draft
          </Button>
        </div>
      }
    >
      {/* Analysis metadata bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-card">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
            {run.run_id}
          </span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-600">
            Analyzed: {formatDateTime(run.updated_at)}
          </span>
        </div>
        {typeof docsProcessed === "number" && (
          <>
            <div className="w-px h-4 bg-slate-200" />
            <span className="text-xs text-slate-500">
              {docsProcessed} document{docsProcessed === 1 ? "" : "s"} processed
            </span>
          </>
        )}
        <div className="w-px h-4 bg-slate-200" />
        {run.status === "failed" ? (
          <Badge variant="failed" dot>
            Failed
          </Badge>
        ) : totalFlags > 0 ? (
          <Badge variant="conflict" dot>
            Needs Review
          </Badge>
        ) : (
          <Badge variant="success" dot>
            Clean
          </Badge>
        )}
        {totalFlags > 0 && (
          <>
            <div className="w-px h-4 bg-slate-200" />
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-rose-600">{totalFlags} item{totalFlags === 1 ? "" : "s"}</span>{" "}
              require clinician attention
            </span>
          </>
        )}
        <div className="ml-auto">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            DRAFT — Not finalized
          </span>
        </div>
      </div>

      {run.status === "failed" && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-800 mb-1">Analysis failed</p>
            <p className="text-sm text-rose-700 break-words">{run.error || "Unknown error"}</p>
          </div>
        </div>
      )}

      {/* Split layout */}
      <div
        className="flex gap-6"
        style={{ height: "calc(100vh - 260px)", minHeight: "600px" }}
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          <SummaryPanel summary={run.summary_draft} />
        </div>
        <div className="w-96 flex-shrink-0 overflow-hidden">
          <AlertsPanel warnings={run.warnings} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Analysis Results" subtitle="Loading…">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
          </div>
        </DashboardLayout>
      }
    >
      <ResultsInner />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, ChevronRight, Inbox, Loader2, AlertCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import { listRuns, type RunListItem, type RunStatus } from "@/lib/api";
import type { BadgeVariant } from "@/types";

const statusBadge: Record<RunStatus, BadgeVariant> = {
  pending: "processing",
  processing: "processing",
  completed: "success",
  failed: "failed",
};

const statusLabel: Record<RunStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export default function RecentAnalyses() {
  const [runs, setRuns] = useState<RunListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listRuns(20)
      .then((data) => {
        if (!cancelled) setRuns(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.detail || err?.message || "Failed to load runs");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 shadow-card flex items-start gap-3 p-6">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-rose-800 mb-1">
            Could not load recent analyses
          </p>
          <p className="text-sm text-rose-700 break-words">{error}</p>
        </div>
      </div>
    );
  }

  if (runs === null) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-card flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-card flex flex-col items-center justify-center py-20 text-center">
        <Inbox className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-slate-600 font-medium">No analyses yet</p>
        <p className="text-sm text-slate-400 mt-1">
          Run your first analysis to see results here.
        </p>
        <div className="mt-4">
          <Link href="/upload">
            <Button size="sm">New Analysis</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Recent Analyses</h2>
          <p className="text-xs text-slate-400 mt-0.5">{runs.length} entries</p>
        </div>
        <Link href="/upload">
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
          >
            New analysis
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Run ID", "Created", "Updated", "Steps", "Status", "Actions"].map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {runs.map((r, i) => {
              const variant = statusBadge[r.status] ?? "default";
              const isViewable = r.status === "completed" || r.status === "failed";
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.4) }}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {r.id.slice(0, 8)}…
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    {formatDateTime(r.created_at)}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    {formatDateTime(r.updated_at)}
                  </td>
                  <td className="px-6 py-4 text-slate-700 text-sm">{r.step_count}</td>
                  <td className="px-6 py-4">
                    <Badge variant={variant} dot>
                      {statusLabel[r.status] ?? r.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {r.status === "processing" || r.status === "pending" ? (
                        <Link href={`/processing?runId=${encodeURIComponent(r.id)}`}>
                          <Button size="sm" variant="secondary">
                            View progress
                          </Button>
                        </Link>
                      ) : isViewable ? (
                        <>
                          <Link href={`/results?runId=${encodeURIComponent(r.id)}`}>
                            <Button
                              size="sm"
                              variant="secondary"
                              rightIcon={<ExternalLink className="w-3 h-3" />}
                            >
                              Results
                            </Button>
                          </Link>
                          <Link href={`/trace?runId=${encodeURIComponent(r.id)}`}>
                            <Button size="sm" variant="ghost">
                              Trace
                            </Button>
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, ExternalLink, ChevronRight, Inbox } from "lucide-react";
import { recentAnalyses } from "@/lib/mockData";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import type { AnalysisStatus, BadgeVariant } from "@/types";

const statusBadgeMap: Record<AnalysisStatus, BadgeVariant> = {
  completed: "success",
  needs_review: "conflict",
  processing: "processing",
  failed: "failed",
};

const statusLabel: Record<AnalysisStatus, string> = {
  completed: "Completed",
  needs_review: "Needs Review",
  processing: "Processing",
  failed: "Failed",
};

export default function RecentAnalyses() {
  if (recentAnalyses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-card flex flex-col items-center justify-center py-20 text-center">
        <Inbox className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-slate-600 font-medium">No analyses yet</p>
        <p className="text-sm text-slate-400 mt-1">Run your first analysis to see results here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Recent Analyses</h2>
          <p className="text-xs text-slate-400 mt-0.5">{recentAnalyses.length} entries</p>
        </div>
        <Link href="/results">
          <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
            View all
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Patient", "Analysis ID", "Date", "Docs", "Alerts", "Status", "Actions"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recentAnalyses.map((analysis, i) => (
              <motion.tr
                key={analysis.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-600 text-xs font-bold">
                        {analysis.patientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{analysis.patientName}</p>
                      <p className="text-xs text-slate-400">{analysis.patientId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    {analysis.id}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 text-xs">
                  {formatDateTime(analysis.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm">{analysis.documentCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {analysis.alertCount > 0 ? (
                    <span className="text-sm font-semibold text-rose-600">
                      {analysis.alertCount}
                    </span>
                  ) : analysis.status === "processing" ? (
                    <span className="text-slate-400 text-xs">—</span>
                  ) : (
                    <span className="text-emerald-600 text-sm font-semibold">0</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={statusBadgeMap[analysis.status]} dot>
                    {statusLabel[analysis.status]}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href="/results">
                      <Button size="sm" variant="secondary" rightIcon={<ExternalLink className="w-3 h-3" />}>
                        Results
                      </Button>
                    </Link>
                    <Link href="/trace">
                      <Button size="sm" variant="ghost">
                        Trace
                      </Button>
                    </Link>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

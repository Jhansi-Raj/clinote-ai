import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SummaryPanel from "@/components/results/SummaryPanel";
import AlertsPanel from "@/components/results/AlertsPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Download, FileSearch, Calendar, User } from "lucide-react";

export default function ResultsPage() {
  return (
    <DashboardLayout
      title="Analysis Results"
      subtitle="AN-2024-0091 · Review required before finalizing"
      actions={
        <div className="flex items-center gap-2">
          <Link href="/trace">
            <Button variant="secondary" size="sm" leftIcon={<FileSearch className="w-3.5 h-3.5" />}>
              View Trace
            </Button>
          </Link>
          <Button variant="primary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export Draft
          </Button>
        </div>
      }
    >
      {/* Analysis metadata bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-card">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-800">John Doe</span>
          <span className="text-xs text-slate-400">PT-10042</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-600">Analyzed: Jul 15, 2024 at 09:22 AM</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <Badge variant="conflict" dot>Needs Review</Badge>
        <div className="w-px h-4 bg-slate-200" />
        <span className="text-xs text-slate-500">
          <span className="font-semibold text-rose-600">8 items</span> require clinician attention
        </span>
        <div className="ml-auto">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            DRAFT — Not finalized
          </span>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex gap-6" style={{ height: "calc(100vh - 260px)", minHeight: "600px" }}>
        {/* Summary panel — left, larger */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <SummaryPanel />
        </div>

        {/* Alerts panel — right, fixed width */}
        <div className="w-96 flex-shrink-0 overflow-hidden">
          <AlertsPanel />
        </div>
      </div>
    </DashboardLayout>
  );
}

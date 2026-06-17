import DashboardLayout from "@/components/layout/DashboardLayout";
import TraceTimeline from "@/components/trace/TraceTimeline";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Download, Calendar, User, FileText, Hash } from "lucide-react";

export default function TracePage() {
  return (
    <DashboardLayout
      title="Audit Trail"
      subtitle="Full step-by-step trace of the AI analysis"
      actions={
        <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
          Export Trace
        </Button>
      }
    >
      {/* Trace metadata */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-card">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-slate-400" />
          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
            AN-2024-0091
          </span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-700">John Doe · PT-10042</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500">Jul 15, 2024 at 09:22 AM</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500">8 steps · 5 documents</span>
        </div>
        <div className="ml-auto">
          <Badge variant="success" dot>Trace Complete</Badge>
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
          <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="max-w-3xl">
        <TraceTimeline />
      </div>
    </DashboardLayout>
  );
}

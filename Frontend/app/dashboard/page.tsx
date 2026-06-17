import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentAnalyses from "@/components/dashboard/RecentAnalyses";
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Overview of all clinical analyses"
      actions={
        <Link href="/upload">
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            New Analysis
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <StatsCards />

        {/* Quick notice */}
        <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-xl px-5 py-3.5">
          <span className="text-teal-500 text-xs font-bold mt-0.5 flex-shrink-0">ℹ</span>
          <p className="text-teal-800 text-sm">
            <span className="font-semibold">All outputs are drafts.</span> Clinote AI never
            auto-finalizes a summary. Every analysis requires clinician review before the document is
            considered complete.
          </p>
        </div>

        <RecentAnalyses />
      </div>
    </DashboardLayout>
  );
}

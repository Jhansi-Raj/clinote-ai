"use client";

import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DropZone from "@/components/upload/DropZone";
import Button from "@/components/ui/Button";
import { ArrowRight, Info } from "lucide-react";

export default function UploadPage() {
  return (
    <DashboardLayout
      title="New Analysis"
      subtitle="Upload patient documents to begin"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Patient info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Patient Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Patient Name
              </label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Patient ID / MRN
              </label>
              <input
                type="text"
                defaultValue="PT-10042"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Analysis Type
              </label>
              <select className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
                <option>Discharge Summary</option>
                <option>Admission Summary</option>
                <option>Progress Note Summary</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Requesting Clinician
              </label>
              <input
                type="text"
                defaultValue="Dr. Sarah Chen"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* Drop zone */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Source Documents</h2>
          <DropZone />
        </div>

        {/* Safety notice */}
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-1">
            <p className="font-semibold">Before running the analysis:</p>
            <ul className="list-disc list-inside text-xs space-y-0.5 text-amber-700">
              <li>Ensure all source documents belong to the same patient</li>
              <li>Include all available notes for the admission episode</li>
              <li>The AI will flag anything it cannot source — do not fill missing fields manually</li>
            </ul>
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Link href="/processing">
            <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Run Clinote AI
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

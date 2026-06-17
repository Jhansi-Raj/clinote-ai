"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DropZone from "@/components/upload/DropZone";
import Button from "@/components/ui/Button";
import { ArrowRight, Info, AlertCircle } from "lucide-react";
import { uploadDocuments } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!files.length) {
      setError("Add at least one PDF before running the analysis.");
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      const res = await uploadDocuments(files);
      router.push(`/processing?runId=${encodeURIComponent(res.run_id)}`);
    } catch (err) {
      const msg =
        err instanceof Error
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (err as any).detail || err.message
          : "Upload failed. Please try again.";
      setError(String(msg));
      setIsUploading(false);
    }
  };

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
          <DropZone files={files} onChange={setFiles} disabled={isUploading} />
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

        {/* Error */}
        {error && (
          <div className="flex gap-3 bg-rose-50 border border-rose-200 rounded-xl px-5 py-4">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-800 break-words">{error}</p>
          </div>
        )}

        {/* Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard">
            <Button variant="ghost" disabled={isUploading}>Cancel</Button>
          </Link>
          <Button
            size="lg"
            onClick={handleRun}
            loading={isUploading}
            disabled={isUploading || files.length === 0}
            rightIcon={!isUploading ? <ArrowRight className="w-4 h-4" /> : undefined}
          >
            {isUploading ? "Uploading..." : "Run Clinote AI"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

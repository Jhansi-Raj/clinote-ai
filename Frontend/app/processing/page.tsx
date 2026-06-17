"use client";

import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProcessingStepper from "@/components/processing/ProcessingStepper";
import { ShieldAlert, FileText } from "lucide-react";

export default function ProcessingPage() {
  return (
    <DashboardLayout
      title="Processing Analysis"
      subtitle="AN-2024-0091 · John Doe · PT-10042"
    >
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
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-teal-400"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">
              Clinote AI is analyzing your documents
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              5 documents · Discharge summary · Do not close this window
            </p>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200"
          >
            RUNNING
          </motion.div>
        </motion.div>

        {/* Stepper */}
        <ProcessingStepper />

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

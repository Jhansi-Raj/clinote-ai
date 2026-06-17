"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";

const trustItems = [
  { icon: ShieldCheck, label: "HIPAA Ready" },
  { icon: XCircle, label: "Zero Fabrication" },
  { icon: CheckCircle, label: "Clinician-in-Loop" },
];

const floatingBadges = [
  { label: "MISSING", color: "bg-rose-100 text-rose-700 border-rose-200", icon: XCircle, top: "12%", left: "5%" },
  { label: "CONFLICT DETECTED", color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle, top: "60%", right: "4%" },
  { label: "PENDING REVIEW", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock, bottom: "15%", left: "10%" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.22, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-teal-400 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.1, 0.16, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-400 blur-[140px]"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-6"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Trusted by Clinical Teams
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.08] mb-6">
              <span className="gradient-text">Safe AI summaries.</span>
              <br />
              <span className="text-slate-800">No guessing.</span>
              <br />
              <span className="text-slate-600">No assumptions.</span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
              Clinote AI reads your clinical documents and produces structured discharge drafts —
              always flagging what&apos;s missing, what conflicts, and what&apos;s still pending.
              Every output is a draft for human review. Never auto-finalized.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/dashboard">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View Dashboard
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="ghost">
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6">
              {trustItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                  <Icon className="w-4 h-4 text-teal-600" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Animated card mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Main card */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 relative z-10"
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Discharge Summary Draft
                    </p>
                    <p className="text-sm font-semibold text-slate-900">John Doe · AN-2024-0091</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wide">
                    Needs Review
                  </span>
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  {[
                    { label: "Principal Diagnosis", value: "Acute CHF Exacerbation", status: "ok" },
                    { label: "Discharge Date", value: "⚠ Conflicting values found", status: "conflict" },
                    { label: "Insurance ID", value: "Not documented", status: "missing" },
                    { label: "Nephrology Report", value: "Pending — consult ordered", status: "pending" },
                  ].map(({ label, value, status }) => (
                    <div
                      key={label}
                      className="flex items-start justify-between p-3 rounded-lg bg-slate-50 gap-3"
                    >
                      <span className="text-xs text-slate-500 font-medium flex-shrink-0 mt-0.5">
                        {label}
                      </span>
                      <span
                        className={
                          status === "ok"
                            ? "text-xs text-slate-800 font-medium text-right"
                            : status === "conflict"
                            ? "text-xs text-amber-700 font-semibold text-right"
                            : status === "missing"
                            ? "text-xs text-rose-600 font-semibold text-right"
                            : "text-xs text-blue-600 font-medium text-right"
                        }
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">8 items require review</span>
                  <span className="text-[11px] font-semibold text-teal-600">Draft · Not finalized</span>
                </div>
              </motion.div>

              {/* Floating badges */}
              {floatingBadges.map(({ label, color, icon: Icon, ...pos }) => (
                <motion.div
                  key={label}
                  style={pos as React.CSSProperties}
                  className="absolute z-20"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2,
                  }}
                >
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-md ${color}`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </div>
                </motion.div>
              ))}

              {/* Background card shadow */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-indigo-100 rounded-2xl transform rotate-2 scale-[0.98] -z-0 opacity-60" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

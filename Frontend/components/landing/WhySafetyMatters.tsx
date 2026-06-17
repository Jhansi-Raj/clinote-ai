"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, AlertOctagon, Check, X } from "lucide-react";

const bullets = [
  {
    icon: ShieldCheck,
    title: "Clinical facts only",
    body: "Every field in the draft is directly sourced from a document. No extrapolation, no plausible defaults.",
  },
  {
    icon: AlertOctagon,
    title: "Explicit about uncertainty",
    body: "Unknown is labeled unknown. Conflicting is labeled conflicting. Pending is labeled pending. Always.",
  },
  {
    icon: ShieldCheck,
    title: "Clinician owns finalization",
    body: "Clinote AI never produces a final document. It produces a draft for a qualified human to review and approve.",
  },
];

const comparison = [
  { dimension: "Invents missing values", traditional: true, clinote: false },
  { dimension: "Picks one value when two conflict", traditional: true, clinote: false },
  { dimension: "Surfaces drug interactions", traditional: false, clinote: true },
  { dimension: "Labels every missing field", traditional: false, clinote: true },
  { dimension: "Requires clinician sign-off", traditional: false, clinote: true },
  { dimension: "Full audit trail per step", traditional: false, clinote: true },
];

export default function WhySafetyMatters() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div ref={ref} className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55 }}
          >
            <span className="inline-block text-xs font-semibold text-teal-400 uppercase tracking-widest mb-3">
              Why Safety Matters
            </span>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-6 leading-tight">
              Built for the stakes
              <br />
              of clinical care.
            </h2>
            <p className="text-slate-400 mb-10 leading-relaxed">
              Most AI tools optimize for completeness — filling every field, even when there&apos;s
              nothing reliable to fill it with. In clinical settings, a confident wrong answer is
              more dangerous than an honest gap.
            </p>

            <div className="space-y-6">
              {bullets.map(({ icon: Icon, title, body }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.1 * i }}
                  className="flex gap-4"
                >
                  <div className="w-9 h-9 rounded-lg bg-teal-900/60 border border-teal-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">{title}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — comparison table */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-3 gap-0 border-b border-slate-700">
                <div className="px-5 py-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  Behavior
                </div>
                <div className="px-5 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider text-center border-l border-slate-700">
                  Generic AI
                </div>
                <div className="px-5 py-4 text-teal-400 text-xs font-semibold uppercase tracking-wider text-center border-l border-slate-700">
                  Clinote AI
                </div>
              </div>

              {comparison.map(({ dimension, traditional, clinote }, i) => (
                <motion.div
                  key={dimension}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.05 * i + 0.2 }}
                  className="grid grid-cols-3 gap-0 border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="px-5 py-3.5 text-sm text-slate-300">{dimension}</div>
                  <div className="px-5 py-3.5 flex items-center justify-center border-l border-slate-700/50">
                    {traditional ? (
                      <div className="w-5 h-5 rounded-full bg-rose-900/40 flex items-center justify-center">
                        <Check className="w-3 h-3 text-rose-400" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-700/60 flex items-center justify-center">
                        <X className="w-3 h-3 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-3.5 flex items-center justify-center border-l border-slate-700/50">
                    {clinote ? (
                      <div className="w-5 h-5 rounded-full bg-teal-900/50 flex items-center justify-center">
                        <Check className="w-3 h-3 text-teal-400" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-700/60 flex items-center justify-center">
                        <X className="w-3 h-3 text-slate-500" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

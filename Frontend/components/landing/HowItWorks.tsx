"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UploadCloud, ScanLine, UserCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UploadCloud,
    title: "Upload Documents",
    description:
      "Drop in the patient's source-note PDFs — admission notes, progress notes, lab results, and medication records. No formatting required.",
    color: "teal",
  },
  {
    step: "02",
    icon: ScanLine,
    title: "AI Reads & Flags",
    description:
      "The agent extracts clinical facts, reconciles medications, checks for conflicts across documents, and calls safety tools. Every gap is surfaced — nothing is assumed.",
    color: "indigo",
  },
  {
    step: "03",
    icon: UserCheck,
    title: "Clinician Reviews Draft",
    description:
      "You receive a structured discharge summary draft with every missing field, conflict, and pending item clearly labeled. Finalization is always your decision.",
    color: "teal",
  },
];

const colorMap: Record<string, { bg: string; text: string; ring: string; connector: string }> = {
  teal: {
    bg: "bg-teal-50",
    text: "text-teal-600",
    ring: "ring-teal-200",
    connector: "from-teal-200 to-indigo-200",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    ring: "ring-indigo-200",
    connector: "from-indigo-200 to-teal-200",
  },
};

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-semibold text-teal-600 uppercase tracking-widest mb-3">
            How It Works
          </span>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            From raw notes to a reviewed draft
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            A three-step process designed around clinical safety — not convenience.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const colors = colorMap[step.color];
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 * i }}
                className="relative"
              >
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full z-0">
                    <div className="flex items-center justify-center h-px mx-4">
                      <div
                        className={`flex-1 h-px bg-gradient-to-r ${colors.connector} opacity-60`}
                      />
                      <ArrowRight className="w-4 h-4 text-slate-300 mx-1 flex-shrink-0" />
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200 relative z-10">
                  {/* Step number */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl ${colors.bg} ring-2 ${colors.ring} flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <span className="text-3xl font-black text-slate-100 select-none">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

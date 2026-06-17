"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar,
  Stethoscope,
  Activity,
  AlertTriangle,
  ClipboardList,
  HeartPulse,
  ChevronDown,
  Pill,
  Printer,
} from "lucide-react";
import { summarySections, medications } from "@/lib/mockData";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { FieldStatus, MedChangeType } from "@/types";

const sectionIcons: Record<string, React.ElementType> = {
  User,
  Calendar,
  Stethoscope,
  Activity,
  AlertTriangle,
  ClipboardList,
  HeartPulse,
};

const fieldStatusBadge: Record<FieldStatus, { variant: "missing" | "conflict" | "pending" | "success"; label: string }> = {
  ok: { variant: "success", label: "" },
  missing: { variant: "missing", label: "NOT DOCUMENTED" },
  conflict: { variant: "conflict", label: "CONFLICT" },
  pending: { variant: "pending", label: "PENDING" },
};

const medChangeBadge: Record<MedChangeType, { variant: "added" | "stopped" | "changed" | "unchanged"; label: string }> = {
  added: { variant: "added", label: "ADDED" },
  stopped: { variant: "stopped", label: "STOPPED" },
  changed: { variant: "changed", label: "CHANGED" },
  unchanged: { variant: "unchanged", label: "UNCHANGED" },
};

export default function SummaryPanel() {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(summarySections.map((s) => s.id))
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Summary Draft</h2>
          <p className="text-xs text-slate-400 mt-0.5">Draft only — not finalized</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Printer className="w-3.5 h-3.5" />}
        >
          Export Draft
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-3 overflow-y-auto flex-1 pr-1">
        {summarySections.map((section) => {
          const Icon = sectionIcons[section.icon] ?? User;
          const isOpen = expanded.has(section.id);
          const flagCount = section.fields.filter(
            (f) => f.status !== "ok"
          ).length;

          return (
            <div
              key={section.id}
              className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden"
            >
              {/* Section header */}
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{section.title}</span>
                  {flagCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      {flagCount} flag{flagCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-slate-100 divide-y divide-slate-50">
                      {section.fields.map((field) => {
                        const s = fieldStatusBadge[field.status];
                        return (
                          <div key={field.label} className="px-5 py-3.5">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-xs font-medium text-slate-500 flex-shrink-0 mt-0.5 w-36">
                                {field.label}
                              </span>
                              <div className="flex-1 text-right">
                                {field.status === "ok" ? (
                                  <span className="text-sm text-slate-800">{field.value}</span>
                                ) : field.status === "missing" ? (
                                  <Badge variant="missing">{s.label}</Badge>
                                ) : (
                                  <div className="flex flex-col items-end gap-1.5">
                                    {field.value && (
                                      <span className="text-sm text-slate-700">{field.value}</span>
                                    )}
                                    <Badge variant={s.variant}>{s.label}</Badge>
                                    {field.conflictNote && (
                                      <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5 text-left mt-1">
                                        {field.conflictNote}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Medications card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <button
            onClick={() => toggle("medications")}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Pill className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-slate-800">Discharge Medications</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                2 flagged
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                expanded.has("medications") && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence initial={false}>
            {expanded.has("medications") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {medications.map((med) => {
                    const badge = medChangeBadge[med.changeType];
                    return (
                      <div
                        key={med.name}
                        className={cn(
                          "px-5 py-3.5",
                          med.flagged && "bg-amber-50/50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-slate-800">
                                {med.name}
                              </span>
                              <Badge variant={badge.variant}>{badge.label}</Badge>
                              {med.flagged && (
                                <Badge variant="conflict">
                                  <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                                  Flag
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {med.dose} · {med.frequency}
                            </p>
                            {med.changeNote && (
                              <p className={cn(
                                "text-xs mt-1.5 px-2 py-1.5 rounded-lg",
                                med.flagged ? "bg-amber-100 text-amber-800" : "bg-slate-50 text-slate-600"
                              )}>
                                {med.changeNote}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

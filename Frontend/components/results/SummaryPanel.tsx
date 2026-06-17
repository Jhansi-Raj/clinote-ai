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
  FileQuestion,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { FieldStatus, MedChangeType } from "@/types";
import type { BackendSummaryDraft, BackendSection } from "@/lib/api";

interface SummaryPanelProps {
  summary: BackendSummaryDraft | null;
}

const sectionIcons: Record<string, React.ElementType> = {
  User,
  Calendar,
  Stethoscope,
  Activity,
  AlertTriangle,
  ClipboardList,
  HeartPulse,
};

// Best-effort icon picker based on section id/title.
function pickIcon(section: BackendSection): React.ElementType {
  const key = `${section.id} ${section.title}`.toLowerCase();
  if (/(demograph|patient|name)/.test(key)) return User;
  if (/(date|admission|discharge|stay)/.test(key)) return Calendar;
  if (/(diagnos)/.test(key)) return Stethoscope;
  if (/(procedure|intervention)/.test(key)) return Activity;
  if (/(allerg)/.test(key)) return AlertTriangle;
  if (/(follow|education|discharge instruction)/.test(key)) return ClipboardList;
  if (/(condition|status)/.test(key)) return HeartPulse;
  if (section.icon && sectionIcons[section.icon]) return sectionIcons[section.icon];
  return FileQuestion;
}

const fieldStatusBadge: Record<
  FieldStatus,
  { variant: "missing" | "conflict" | "pending" | "success"; label: string }
> = {
  ok: { variant: "success", label: "" },
  missing: { variant: "missing", label: "NOT DOCUMENTED" },
  conflict: { variant: "conflict", label: "CONFLICT" },
  pending: { variant: "pending", label: "PENDING" },
};

const medChangeBadge: Record<
  MedChangeType,
  { variant: "added" | "stopped" | "changed" | "unchanged"; label: string }
> = {
  added: { variant: "added", label: "ADDED" },
  stopped: { variant: "stopped", label: "STOPPED" },
  changed: { variant: "changed", label: "CHANGED" },
  unchanged: { variant: "unchanged", label: "UNCHANGED" },
};

export default function SummaryPanel({ summary }: SummaryPanelProps) {
  const sections = summary?.sections ?? [];
  const medications = summary?.medications ?? [];

  const [expanded, setExpanded] = useState<Set<string>>(
    new Set([...sections.map((s) => s.id), "medications"]),
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!summary || (!sections.length && !medications.length)) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Summary Draft</h2>
            <p className="text-xs text-slate-400 mt-0.5">No summary available</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-card">
          <div className="text-center px-6 py-12">
            <FileQuestion className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              The agent didn&apos;t produce a summary draft for this run.
            </p>
            {summary?.metadata?.generation_error && (
              <p className="text-xs text-rose-600 mt-2 max-w-xs mx-auto break-words">
                {summary.metadata.generation_error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const flaggedMedCount = medications.filter((m) => m.flagged).length;

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
        {sections.map((section) => {
          const Icon = pickIcon(section);
          const isOpen = expanded.has(section.id);
          const flagCount = section.fields.filter((f) => f.status !== "ok").length;

          return (
            <div
              key={section.id}
              className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden"
            >
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
                    isOpen && "rotate-180",
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
                      {section.fields.map((field, idx) => {
                        const fStatus = (field.status as FieldStatus) ?? "ok";
                        const s = fieldStatusBadge[fStatus] ?? fieldStatusBadge.ok;
                        return (
                          <div key={`${field.label}-${idx}`} className="px-5 py-3.5">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-xs font-medium text-slate-500 flex-shrink-0 mt-0.5 w-36">
                                {field.label}
                              </span>
                              <div className="flex-1 text-right">
                                {fStatus === "ok" ? (
                                  <span className="text-sm text-slate-800">
                                    {field.value ?? "—"}
                                  </span>
                                ) : fStatus === "missing" ? (
                                  <Badge variant="missing">{s.label}</Badge>
                                ) : (
                                  <div className="flex flex-col items-end gap-1.5">
                                    {field.value && (
                                      <span className="text-sm text-slate-700">{field.value}</span>
                                    )}
                                    <Badge variant={s.variant}>{s.label}</Badge>
                                    {field.conflict_note && (
                                      <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5 text-left mt-1">
                                        {field.conflict_note}
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
        {medications.length > 0 && (
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
                {flaggedMedCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {flaggedMedCount} flagged
                  </span>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-400 transition-transform duration-200",
                  expanded.has("medications") && "rotate-180",
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
                    {medications.map((med, i) => {
                      const change = (med.change_type ?? "unchanged") as MedChangeType;
                      const badge = medChangeBadge[change];
                      return (
                        <div
                          key={`${med.name}-${i}`}
                          className={cn(
                            "px-5 py-3.5",
                            med.flagged && "bg-amber-50/50",
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
                              {(med.dose || med.frequency) && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {[med.dose, med.frequency].filter(Boolean).join(" · ")}
                                </p>
                              )}
                              {med.change_note && (
                                <p
                                  className={cn(
                                    "text-xs mt-1.5 px-2 py-1.5 rounded-lg",
                                    med.flagged
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-50 text-slate-600",
                                  )}
                                >
                                  {med.change_note}
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
        )}
      </div>
    </div>
  );
}

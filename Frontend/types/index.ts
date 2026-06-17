export type AnalysisStatus = "completed" | "needs_review" | "processing" | "failed";

export type BadgeVariant =
  | "default"
  | "missing"
  | "conflict"
  | "pending"
  | "escalation"
  | "success"
  | "processing"
  | "failed"
  | "added"
  | "stopped"
  | "changed"
  | "unchanged";

export type AlertType = "missing" | "conflict" | "pending" | "escalation";

export type AlertSeverity = "high" | "medium" | "low";

export type FieldStatus = "ok" | "missing" | "conflict" | "pending";

export type MedChangeType = "added" | "stopped" | "changed" | "unchanged";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  field: string;
  message: string;
  sources?: { label: string; value: string }[];
  requiresDecision?: boolean;
}

export interface SummaryField {
  label: string;
  value: string | null;
  status: FieldStatus;
  conflictNote?: string;
}

export interface SummarySection {
  id: string;
  title: string;
  icon: string;
  fields: SummaryField[];
}

export interface MedicationEntry {
  name: string;
  dose: string;
  frequency: string;
  changeType: MedChangeType;
  changeNote?: string;
  flagged?: boolean;
}

export interface Analysis {
  id: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  status: AnalysisStatus;
  documentCount: number;
  alertCount: number;
  analysisType: string;
}

export interface TraceStep {
  id: string;
  stepNumber: number;
  timestamp: string;
  phase: string;
  reasoning: string;
  action: string;
  inputs: Record<string, string>;
  result: string;
  status: "completed" | "active" | "error" | "skipped";
  resultType?: "info" | "warning" | "error" | "success";
}

export interface ProcessingStep {
  id: string;
  label: string;
  detail: string;
  status: "pending" | "active" | "completed" | "error";
}

export interface StatCard {
  id: string;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: string;
  color: string;
}

import type {
  Analysis,
  Alert,
  MedicationEntry,
  SummarySection,
  TraceStep,
  ProcessingStep,
  StatCard,
} from "@/types";

export const recentAnalyses: Analysis[] = [
  {
    id: "AN-2024-0091",
    patientId: "PT-10042",
    patientName: "John Doe",
    createdAt: "2024-07-15T09:22:00Z",
    status: "needs_review",
    documentCount: 5,
    alertCount: 7,
    analysisType: "Discharge Summary",
  },
  {
    id: "AN-2024-0090",
    patientId: "PT-10039",
    patientName: "Mary Smith",
    createdAt: "2024-07-14T14:05:00Z",
    status: "completed",
    documentCount: 4,
    alertCount: 2,
    analysisType: "Discharge Summary",
  },
  {
    id: "AN-2024-0089",
    patientId: "PT-10037",
    patientName: "Robert Chen",
    createdAt: "2024-07-14T11:30:00Z",
    status: "needs_review",
    documentCount: 6,
    alertCount: 5,
    analysisType: "Discharge Summary",
  },
  {
    id: "AN-2024-0088",
    patientId: "PT-10033",
    patientName: "Patricia Johnson",
    createdAt: "2024-07-13T16:45:00Z",
    status: "completed",
    documentCount: 3,
    alertCount: 1,
    analysisType: "Discharge Summary",
  },
  {
    id: "AN-2024-0087",
    patientId: "PT-10029",
    patientName: "Michael Torres",
    createdAt: "2024-07-13T09:10:00Z",
    status: "processing",
    documentCount: 7,
    alertCount: 0,
    analysisType: "Discharge Summary",
  },
  {
    id: "AN-2024-0086",
    patientId: "PT-10025",
    patientName: "Linda Okafor",
    createdAt: "2024-07-12T13:20:00Z",
    status: "failed",
    documentCount: 2,
    alertCount: 0,
    analysisType: "Discharge Summary",
  },
];

export const summarySections: SummarySection[] = [
  {
    id: "demographics",
    title: "Patient Demographics",
    icon: "User",
    fields: [
      { label: "Full Name", value: "John Doe", status: "ok" },
      { label: "Date of Birth", value: "March 4, 1962 (Age 62)", status: "ok" },
      { label: "MRN", value: "PT-10042", status: "ok" },
      { label: "Gender", value: "Male", status: "ok" },
      { label: "Insurance ID", value: null, status: "missing" },
      { label: "Emergency Contact", value: null, status: "missing" },
    ],
  },
  {
    id: "dates",
    title: "Admission & Discharge Dates",
    icon: "Calendar",
    fields: [
      { label: "Admission Date", value: "July 8, 2024", status: "ok" },
      {
        label: "Discharge Date",
        value: "July 15, 2024",
        status: "conflict",
        conflictNote:
          "Admission note states July 15; Progress Note #3 states July 14. Discrepancy not reconciled in source documents.",
      },
      { label: "Length of Stay", value: "7 days (approximate)", status: "pending" },
      { label: "Discharging Physician", value: "Dr. Karen Walsh, MD", status: "ok" },
      { label: "Admitting Unit", value: "Internal Medicine — Ward 4B", status: "ok" },
    ],
  },
  {
    id: "diagnoses",
    title: "Diagnoses",
    icon: "Stethoscope",
    fields: [
      {
        label: "Principal Diagnosis",
        value: "Acute exacerbation of congestive heart failure (CHF)",
        status: "ok",
      },
      {
        label: "Secondary Diagnosis 1",
        value: "Type 2 Diabetes Mellitus — uncontrolled",
        status: "ok",
      },
      {
        label: "Secondary Diagnosis 2",
        value: "Hypertension",
        status: "ok",
      },
      {
        label: "Secondary Diagnosis 3",
        value: null,
        status: "missing",
      },
      {
        label: "Discharge Diagnosis (Final)",
        value: "CHF Exacerbation / Volume Overload",
        status: "conflict",
        conflictNote:
          "Admission note diagnoses 'acute CHF exacerbation'; Discharge note diagnoses 'CHF with volume overload + CKD stage 2'. Discrepancy must be confirmed by attending.",
      },
    ],
  },
  {
    id: "procedures",
    title: "Procedures & Interventions",
    icon: "Activity",
    fields: [
      { label: "Echocardiogram (2D)", value: "Performed July 9, 2024 — LVEF 35%", status: "ok" },
      {
        label: "Chest X-Ray",
        value: "Performed July 8 and July 13 — bilateral infiltrates, improving on repeat",
        status: "ok",
      },
      { label: "IV Diuresis (Furosemide)", value: "Administered July 8–11, 2024", status: "ok" },
      { label: "Cardiac Catheterization", value: null, status: "pending" },
      { label: "Nephrology Consult", value: "Requested July 12 — report pending", status: "pending" },
    ],
  },
  {
    id: "allergies",
    title: "Allergies",
    icon: "AlertTriangle",
    fields: [
      { label: "Drug Allergy 1", value: "Penicillin — Reaction: Anaphylaxis", status: "ok" },
      { label: "Drug Allergy 2", value: "Sulfonamides — Reaction: Rash", status: "ok" },
      { label: "Food / Environmental Allergies", value: null, status: "missing" },
    ],
  },
  {
    id: "followup",
    title: "Follow-up Instructions",
    icon: "ClipboardList",
    fields: [
      {
        label: "Primary Care Follow-up",
        value: "Within 7 days of discharge — Dr. M. Patel clinic",
        status: "ok",
      },
      {
        label: "Cardiology Follow-up",
        value: "Within 2 weeks — outpatient echo repeat",
        status: "ok",
      },
      { label: "Dietary Restrictions", value: "Low-sodium diet (< 2g/day), fluid restriction 1.5L/day", status: "ok" },
      { label: "Weight Monitoring", value: "Daily weight — notify if +2 lbs in 2 days", status: "ok" },
      {
        label: "Nephrology Follow-up",
        value: null,
        status: "pending",
      },
    ],
  },
  {
    id: "condition",
    title: "Discharge Condition",
    icon: "HeartPulse",
    fields: [
      { label: "Condition at Discharge", value: "Stable", status: "ok" },
      { label: "Functional Status", value: "Ambulatory with assistance", status: "ok" },
      { label: "Patient Education", value: "CHF self-management education provided", status: "ok" },
      { label: "Discharge Destination", value: "Home with outpatient follow-up", status: "ok" },
    ],
  },
];

export const medications: MedicationEntry[] = [
  {
    name: "Furosemide (Lasix)",
    dose: "40 mg",
    frequency: "twice daily",
    changeType: "changed",
    changeNote: "Increased from 20 mg once daily. Reason: diuresis for volume overload.",
  },
  {
    name: "Metoprolol Succinate",
    dose: "50 mg",
    frequency: "once daily",
    changeType: "unchanged",
  },
  {
    name: "Lisinopril",
    dose: "10 mg",
    frequency: "once daily",
    changeType: "unchanged",
  },
  {
    name: "Metformin",
    dose: "500 mg",
    frequency: "twice daily",
    changeType: "stopped",
    changeNote: "Held due to CKD staging. Reason: renal clearance concern — endocrine consult pending.",
  },
  {
    name: "Insulin Glargine",
    dose: "18 units",
    frequency: "at bedtime",
    changeType: "added",
    changeNote: "Initiated for glycemic control during admission. No documented transition plan on discharge.",
    flagged: true,
  },
  {
    name: "Spironolactone",
    dose: "25 mg",
    frequency: "once daily",
    changeType: "added",
    changeNote: "Added for CHF management per cardiology.",
  },
  {
    name: "Atorvastatin",
    dose: "40 mg",
    frequency: "at bedtime",
    changeType: "added",
    changeNote: "No documented indication noted in any source document.",
    flagged: true,
  },
  {
    name: "Aspirin",
    dose: "81 mg",
    frequency: "once daily",
    changeType: "unchanged",
  },
];

export const alerts: Alert[] = [
  {
    id: "ALT-001",
    type: "missing",
    severity: "high",
    field: "Insurance ID",
    message:
      "Patient insurance identifier is absent from all source documents. Required for discharge billing and continuity of care coordination.",
  },
  {
    id: "ALT-002",
    type: "conflict",
    severity: "high",
    field: "Discharge Date",
    message:
      "Two source documents report different discharge dates. This must be reconciled by the discharging clinician before finalizing.",
    sources: [
      { label: "Admission Note (July 8)", value: "Discharge Date: July 15, 2024" },
      { label: "Progress Note #3 (July 13)", value: "Planned discharge: July 14, 2024" },
    ],
  },
  {
    id: "ALT-003",
    type: "conflict",
    severity: "high",
    field: "Final Discharge Diagnosis",
    message:
      "Admission note and discharge note list different primary diagnoses. Agent cannot arbitrarily select one — clinician must confirm the final coded diagnosis.",
    sources: [
      { label: "Admission Note", value: "Acute exacerbation of congestive heart failure" },
      { label: "Discharge Note", value: "CHF with volume overload + CKD Stage 2" },
    ],
  },
  {
    id: "ALT-004",
    type: "escalation",
    severity: "high",
    field: "Drug Interaction: Spironolactone + Lisinopril",
    message:
      "Spironolactone (newly added) combined with Lisinopril (ongoing) carries a risk of hyperkalemia. Drug interaction check tool flagged this combination. Clinician review required before discharge finalization.",
    requiresDecision: true,
  },
  {
    id: "ALT-005",
    type: "missing",
    severity: "high",
    field: "Medication Reconciliation: Atorvastatin",
    message:
      "Atorvastatin 40 mg was added during admission. No documented indication, ordering note, or clinical rationale found in any source document. Cannot be included in final summary without clinician confirmation.",
  },
  {
    id: "ALT-006",
    type: "pending",
    severity: "medium",
    field: "Nephrology Consult Report",
    message:
      "Nephrology consult was requested on July 12 but no report is present in the source documents. Follow-up appointment and CKD management plan cannot be completed until report is received.",
  },
  {
    id: "ALT-007",
    type: "pending",
    severity: "medium",
    field: "Cardiac Catheterization Result",
    message:
      "Cardiac catheterization was ordered; no result or procedure note found in uploaded documents. This procedure's outcome is unconfirmed.",
  },
  {
    id: "ALT-008",
    type: "missing",
    severity: "low",
    field: "Emergency Contact",
    message:
      "No emergency contact information found in any source document. Should be confirmed with patient or family prior to discharge.",
  },
];

export const traceSteps: TraceStep[] = [
  {
    id: "TS-01",
    stepNumber: 1,
    timestamp: "2024-07-15T09:22:04Z",
    phase: "Initialize",
    reasoning:
      "Agent received 5 PDF documents for patient PT-10042. Planning extraction sequence: demographics → dates → diagnoses → medications → procedures → follow-up. Will call drug interaction tool after medication extraction is complete.",
    action: "INITIALIZE_PLAN",
    inputs: { patient_id: "PT-10042", document_count: "5", analysis_type: "discharge_summary" },
    result:
      "Plan created. Processing order established. Drug interaction check tool queued for post-medication extraction.",
    status: "completed",
    resultType: "success",
  },
  {
    id: "TS-02",
    stepNumber: 2,
    timestamp: "2024-07-15T09:22:07Z",
    phase: "Parse Documents",
    reasoning:
      "Extracting full text from all 5 PDFs. Each document is parsed independently. If a document fails to parse, it will be logged as unavailable and the agent will continue with remaining documents.",
    action: "PARSE_PDFS",
    inputs: {
      files:
        "admission_note.pdf, progress_note_1.pdf, progress_note_3.pdf, lab_results.pdf, medication_record.pdf",
    },
    result:
      "5/5 documents parsed successfully. Total extracted: 8,420 tokens. admission_note.pdf: 2,100 tokens. progress_note_3.pdf: 1,870 tokens. lab_results.pdf: 1,540 tokens.",
    status: "completed",
    resultType: "success",
  },
  {
    id: "TS-03",
    stepNumber: 3,
    timestamp: "2024-07-15T09:22:15Z",
    phase: "Extract Demographics",
    reasoning:
      "Extracting patient demographics. Cross-referencing values across documents to detect any discrepancies. Insurance ID not found on initial scan — will attempt to locate in secondary documents before marking as missing.",
    action: "EXTRACT_DEMOGRAPHICS",
    inputs: { strategy: "cross_document_merge", conflict_threshold: "any_mismatch" },
    result:
      "Name, DOB, MRN, Gender extracted. Insurance ID: NOT FOUND in any document — flagged MISSING. Emergency Contact: NOT FOUND — flagged MISSING.",
    status: "completed",
    resultType: "warning",
  },
  {
    id: "TS-04",
    stepNumber: 4,
    timestamp: "2024-07-15T09:22:23Z",
    phase: "Extract Dates & Diagnoses",
    reasoning:
      "Discharge date found in two documents with different values (July 14 vs July 15). Agent cannot select one — both are marked and the conflict is surfaced. Diagnosis: primary confirmed; secondary list partially populated; discharge diagnosis conflicts between admission and discharge notes.",
    action: "EXTRACT_DATES_DIAGNOSES",
    inputs: { sources: "admission_note.pdf, progress_note_3.pdf, discharge_note" },
    result:
      "CONFLICT: Discharge date mismatch — admission note says July 15, progress note #3 says July 14. CONFLICT: Final discharge diagnosis differs between admission note and discharge note. Both conflicts flagged for clinician review.",
    status: "completed",
    resultType: "warning",
  },
  {
    id: "TS-05",
    stepNumber: 5,
    timestamp: "2024-07-15T09:22:34Z",
    phase: "Medication Reconciliation",
    reasoning:
      "Comparing admission medication list against discharge medication list. Identifying adds, stops, changes. For each changed medication, checking for a documented clinical reason. If no reason is found, the medication change is flagged for reconciliation — not silently carried over.",
    action: "RECONCILE_MEDICATIONS",
    inputs: {
      admission_list: "medication_record.pdf (admission section)",
      discharge_list: "medication_record.pdf (discharge section)",
    },
    result:
      "8 medications reconciled. CHANGED: Furosemide (reason documented). STOPPED: Metformin (reason documented). ADDED: Insulin Glargine (no discharge transition plan — flagged). ADDED: Atorvastatin (NO DOCUMENTED INDICATION in any source — flagged MISSING). ADDED: Spironolactone (reason documented).",
    status: "completed",
    resultType: "warning",
  },
  {
    id: "TS-06",
    stepNumber: 6,
    timestamp: "2024-07-15T09:22:40Z",
    phase: "Drug Interaction Check",
    reasoning:
      "Calling external drug interaction tool for all discharge medications. Spironolactone (new) + Lisinopril (existing) is a known interaction pair for hyperkalemia. Will escalate if the tool confirms a clinically significant interaction.",
    action: "CALL_TOOL:drug_interaction_check",
    inputs: {
      medications: "Furosemide, Metoprolol, Lisinopril, Spironolactone, Insulin Glargine, Atorvastatin, Aspirin",
    },
    result:
      "INTERACTION DETECTED: Spironolactone + Lisinopril — Risk: Hyperkalemia (severity: MODERATE). Agent is escalating this finding. It will NOT be suppressed or treated as resolved. Clinician acknowledgment required.",
    status: "completed",
    resultType: "error",
  },
  {
    id: "TS-07",
    stepNumber: 7,
    timestamp: "2024-07-15T09:22:47Z",
    phase: "Pending Items Check",
    reasoning:
      "Scanning all documents for mentions of ordered tests, consults, or procedures with no result found. Any item ordered but with no corresponding result document will be marked PENDING in the summary.",
    action: "EXTRACT_PENDING_ITEMS",
    inputs: { scan_for: "ordered_without_result, result_not_received, follow_up_unconfirmed" },
    result:
      "PENDING: Nephrology consult (requested July 12, no report found). PENDING: Cardiac catheterization (ordered, no result note). PENDING: Nephrology follow-up appointment (not scheduled in documents). CKD Stage confirmed in one note, not confirmed in final diagnosis — noted.",
    status: "completed",
    resultType: "warning",
  },
  {
    id: "TS-08",
    stepNumber: 8,
    timestamp: "2024-07-15T09:22:53Z",
    phase: "Finalize Draft",
    reasoning:
      "All sections extracted. 7 flags generated: 3 MISSING, 2 CONFLICT, 2 PENDING, 1 ESCALATION. Draft is complete. This is a draft for clinician review — it is NOT auto-finalized. No field has been invented or estimated. Every unfilled field is explicitly labeled.",
    action: "GENERATE_DRAFT",
    inputs: {
      sections: "7",
      flags_total: "8",
      missing: "3",
      conflicts: "2",
      pending: "2",
      escalations: "1",
    },
    result:
      "Draft generated. Status: NEEDS REVIEW. 8 items require clinician attention before finalization. Draft saved as AN-2024-0091.",
    status: "completed",
    resultType: "success",
  },
];

export const processingSteps: ProcessingStep[] = [
  {
    id: "PS-01",
    label: "Reading Documents",
    detail: "Parsing and extracting text from uploaded PDFs",
    status: "completed",
  },
  {
    id: "PS-02",
    label: "Extracting Facts",
    detail: "Identifying clinical entities, dates, medications, and diagnoses",
    status: "active",
  },
  {
    id: "PS-03",
    label: "Checking Conflicts",
    detail: "Cross-referencing values across documents and calling safety tools",
    status: "pending",
  },
  {
    id: "PS-04",
    label: "Finalizing Draft",
    detail: "Assembling structured summary with all flags and missing field markers",
    status: "pending",
  },
];

export const statCards: StatCard[] = [
  {
    id: "sc-01",
    label: "Total Analyses",
    value: "247",
    trend: "+12 this week",
    trendUp: true,
    icon: "BarChart3",
    color: "teal",
  },
  {
    id: "sc-02",
    label: "Needs Review",
    value: "14",
    trend: "3 high priority",
    trendUp: false,
    icon: "AlertCircle",
    color: "amber",
  },
  {
    id: "sc-03",
    label: "Flags Raised",
    value: "89",
    trend: "This month",
    trendUp: false,
    icon: "Flag",
    color: "rose",
  },
  {
    id: "sc-04",
    label: "Avg. Processing",
    value: "52s",
    trend: "-8s vs last week",
    trendUp: true,
    icon: "Zap",
    color: "indigo",
  },
];

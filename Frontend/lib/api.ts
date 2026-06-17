// Typed client for the Clinote AI backend.
//
// Set NEXT_PUBLIC_API_URL in your environment (.env.local locally,
// Project Settings → Environment Variables on Vercel) to your Render URL,
// e.g. https://clinote-ai.onrender.com  (no trailing slash).

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

export interface UploadedDocument {
  id: string;
  filename: string;
  size_bytes: number;
}

export interface UploadResponse {
  run_id: string;
  documents: UploadedDocument[];
  message: string;
}

export interface AnalyzeResponse {
  run_id: string;
  status: string;
  message: string;
}

export type RunStatus = "pending" | "processing" | "completed" | "failed";

export interface BackendField {
  label: string;
  value: string | null;
  status: "ok" | "missing" | "conflict" | "pending";
  conflict_note?: string | null;
}

export interface BackendSection {
  id: string;
  title: string;
  icon?: string;
  fields: BackendField[];
}

export interface BackendMedication {
  name: string;
  dose?: string | null;
  frequency?: string | null;
  change_type?: "added" | "stopped" | "changed" | "unchanged";
  change_note?: string | null;
  flagged?: boolean;
}

export interface BackendSummaryDraft {
  metadata?: {
    is_draft?: boolean;
    generated_at?: string;
    total_flags?: number;
    warning_counts?: Record<string, number>;
    run_id?: string;
    documents_processed?: number;
    documents_failed?: number;
    generation_error?: string;
  };
  sections?: BackendSection[];
  medications?: BackendMedication[];
}

export interface BackendWarning {
  type: "missing" | "conflict" | "pending" | "escalation";
  severity: "high" | "medium" | "low";
  field: string;
  message: string;
  sources?: { label: string; value: string }[];
  requires_decision?: boolean;
}

export interface BackendTraceStep {
  step_number: number;
  timestamp: string;
  phase: string;
  reasoning: string;
  action: string;
  inputs: Record<string, unknown>;
  result: string;
  result_type: "info" | "warning" | "error" | "success";
  status: string;
}

export interface RunResult {
  run_id: string;
  status: RunStatus;
  summary_draft: BackendSummaryDraft | null;
  warnings: BackendWarning[];
  trace: BackendTraceStep[];
  step_count: number;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface RunListItem {
  id: string;
  status: RunStatus;
  step_count: number;
  created_at: string;
  updated_at: string;
}

class ApiError extends Error {
  status: number;
  detail?: string;
  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function parseError(res: Response): Promise<never> {
  let detail: string | undefined;
  try {
    const body = await res.json();
    detail = body?.detail || body?.error || JSON.stringify(body);
  } catch {
    detail = await res.text().catch(() => undefined);
  }
  throw new ApiError(res.status, `Request failed (${res.status})`, detail);
}

export async function uploadDocuments(files: File[]): Promise<UploadResponse> {
  if (!files.length) {
    throw new Error("Select at least one PDF before uploading.");
  }
  const form = new FormData();
  for (const f of files) form.append("files", f);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function analyzeRun(runId: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ run_id: runId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function getRun(runId: string): Promise<RunResult> {
  const res = await fetch(`${API_BASE}/runs/${runId}`, { cache: "no-store" });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function listRuns(limit = 50): Promise<RunListItem[]> {
  const res = await fetch(`${API_BASE}/runs?limit=${limit}`, { cache: "no-store" });
  if (!res.ok) await parseError(res);
  return res.json();
}

// Poll a run until it reaches a terminal status. Calls onUpdate after each poll.
export async function pollRun(
  runId: string,
  onUpdate: (run: RunResult) => void,
  opts: { intervalMs?: number; timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<RunResult> {
  const interval = opts.intervalMs ?? 2500;
  const timeout = opts.timeoutMs ?? 5 * 60 * 1000;
  const start = Date.now();

  while (true) {
    if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const run = await getRun(runId);
    onUpdate(run);

    if (run.status === "completed" || run.status === "failed") return run;
    if (Date.now() - start > timeout) {
      throw new Error("Analysis timed out. Try again from the dashboard.");
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

export { ApiError };

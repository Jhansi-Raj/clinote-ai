from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────
# Upload
# ─────────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: str
    filename: str
    size_bytes: int


class UploadResponse(BaseModel):
    run_id: str
    documents: list[DocumentOut]
    message: str = "Documents uploaded successfully. Use run_id to start analysis."


# ─────────────────────────────────────────────────────────────
# Analyze
# ─────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    run_id: str = Field(..., description="run_id returned from /upload")


class AnalyzeResponse(BaseModel):
    run_id: str
    status: str = "processing"
    message: str = "Analysis started. Poll GET /runs/{run_id} for results."


# ─────────────────────────────────────────────────────────────
# Warnings
# ─────────────────────────────────────────────────────────────

class WarningSource(BaseModel):
    label: str
    value: str


class WarningOut(BaseModel):
    type: str
    severity: str
    field: str
    message: str
    sources: list[WarningSource] | None = None
    requires_decision: bool = False


# ─────────────────────────────────────────────────────────────
# Trace
# ─────────────────────────────────────────────────────────────

class TraceStepOut(BaseModel):
    step_number: int
    timestamp: str
    phase: str
    reasoning: str
    action: str
    inputs: dict[str, Any]
    result: str
    result_type: str
    status: str


# ─────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────

class SummaryField(BaseModel):
    label: str
    value: str | None
    status: str  # "ok" | "missing" | "conflict" | "pending"
    conflict_note: str | None = None


class SummarySection(BaseModel):
    id: str
    title: str
    fields: list[SummaryField]


class MedicationEntry(BaseModel):
    name: str
    dose: str | None = None
    frequency: str | None = None
    change_type: str = "unchanged"
    change_note: str | None = None
    flagged: bool = False


class SummaryMetadata(BaseModel):
    is_draft: bool = True
    generated_at: str
    total_flags: int
    warning_counts: dict[str, int]
    run_id: str
    documents_processed: int
    documents_failed: int = 0


class SummaryDraft(BaseModel):
    metadata: SummaryMetadata
    sections: list[SummarySection]
    medications: list[MedicationEntry] = []


# ─────────────────────────────────────────────────────────────
# Run result
# ─────────────────────────────────────────────────────────────

class RunResult(BaseModel):
    run_id: str
    status: str
    summary_draft: dict[str, Any] | None = None
    warnings: list[dict[str, Any]] = []
    trace: list[dict[str, Any]] = []
    step_count: int = 0
    error: str | None = None
    created_at: str
    updated_at: str


class RunListItem(BaseModel):
    id: str
    status: str
    step_count: int
    created_at: str
    updated_at: str


# ─────────────────────────────────────────────────────────────
# Error
# ─────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None

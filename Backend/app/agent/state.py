from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any


class AgentAction(str, Enum):
    READ_PDF = "READ_PDF"
    EXTRACT_FACTS = "EXTRACT_FACTS"
    CHECK_CONFLICTS = "CHECK_CONFLICTS"
    FLAG_MISSING = "FLAG_MISSING"
    ESCALATE = "ESCALATE"
    GENERATE_SUMMARY = "GENERATE_SUMMARY"
    STOP = "STOP"


@dataclass
class TraceStep:
    step_number: int
    timestamp: str
    phase: str
    reasoning: str
    action: str
    inputs: dict[str, Any]
    result: str
    result_type: str  # "success" | "warning" | "error" | "info"
    status: str = "completed"

    def to_dict(self) -> dict:
        return {
            "step_number": self.step_number,
            "timestamp": self.timestamp,
            "phase": self.phase,
            "reasoning": self.reasoning,
            "action": self.action,
            "inputs": self.inputs,
            "result": self.result,
            "result_type": self.result_type,
            "status": self.status,
        }


@dataclass
class AgentWarning:
    type: str        # "missing" | "conflict" | "pending" | "escalation"
    severity: str    # "high" | "medium" | "low"
    field: str
    message: str
    sources: list[dict] | None = None
    requires_decision: bool = False

    def to_dict(self) -> dict:
        d: dict[str, Any] = {
            "type": self.type,
            "severity": self.severity,
            "field": self.field,
            "message": self.message,
        }
        if self.sources:
            d["sources"] = self.sources
        if self.requires_decision:
            d["requires_decision"] = self.requires_decision
        return d


@dataclass
class AgentState:
    run_id: str
    document_ids: list[str]
    max_steps: int = 25

    # Progress counters
    step_count: int = 0

    # Document tracking
    documents_read: list[str] = field(default_factory=list)
    document_texts: dict[str, str] = field(default_factory=dict)      # doc_id -> raw text
    document_meta: dict[str, dict] = field(default_factory=dict)      # doc_id -> {filename, ...}
    failed_documents: list[str] = field(default_factory=list)

    # Extracted data per document
    extracted_facts: dict[str, dict] = field(default_factory=dict)    # doc_id -> structured facts

    # Analysis results
    conflicts: list[AgentWarning] = field(default_factory=list)
    missing_fields: list[AgentWarning] = field(default_factory=list)
    escalations: list[AgentWarning] = field(default_factory=list)

    # Gate flags — track what phases are complete
    fact_extraction_done: bool = False
    conflict_check_done: bool = False
    missing_check_done: bool = False
    summary_generated: bool = False
    hard_stopped: bool = False

    # Final output
    summary_draft: dict = field(default_factory=dict)
    trace_log: list[TraceStep] = field(default_factory=list)

    # ── helpers ────────────────────────────────────────────

    @property
    def all_docs_read(self) -> bool:
        accounted = set(self.documents_read) | set(self.failed_documents)
        return accounted >= set(self.document_ids)

    @property
    def docs_pending_extraction(self) -> list[str]:
        return [d for d in self.documents_read if d not in self.extracted_facts]

    @property
    def all_warnings(self) -> list[AgentWarning]:
        return self.missing_fields + self.conflicts + self.escalations

    def add_trace(
        self,
        phase: str,
        reasoning: str,
        action: str,
        inputs: dict,
        result: str,
        result_type: str = "info",
        status: str = "completed",
    ) -> None:
        self.step_count += 1
        self.trace_log.append(
            TraceStep(
                step_number=self.step_count,
                timestamp=datetime.now(timezone.utc).isoformat(),
                phase=phase,
                reasoning=reasoning,
                action=action,
                inputs=inputs,
                result=result,
                result_type=result_type,
                status=status,
            )
        )

    def state_summary(self) -> str:
        """Plain-English state summary for the LLM planner."""
        lines = [
            f"Run ID: {self.run_id}",
            f"Step: {self.step_count}/{self.max_steps}",
            f"Documents: {len(self.document_ids)} total | "
            f"{len(self.documents_read)} read | "
            f"{len(self.failed_documents)} failed",
            f"Facts extracted: {len(self.extracted_facts)}/{len(self.documents_read)} documents",
            f"Conflict check done: {self.conflict_check_done} | "
            f"Conflicts found: {len(self.conflicts)}",
            f"Missing check done: {self.missing_check_done} | "
            f"Missing fields: {len(self.missing_fields)}",
            f"Escalations: {len(self.escalations)}",
            f"Summary generated: {self.summary_generated}",
        ]
        if self.docs_pending_extraction:
            lines.append(f"Docs pending extraction: {self.docs_pending_extraction}")
        unread = [d for d in self.document_ids if d not in self.documents_read and d not in self.failed_documents]
        if unread:
            lines.append(f"Docs not yet read: {unread}")
        return "\n".join(lines)

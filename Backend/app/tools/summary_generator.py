from __future__ import annotations

import json
from datetime import datetime, timezone

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type

from app.agent.state import AgentState
from app.agent.prompts import SUMMARY_GENERATION_SYSTEM
from app.config import get_settings
from app.tools.base import BaseTool
from app.utils.logger import get_logger

log = get_logger(__name__)


class SummaryGeneratorTool(BaseTool):
    """Generates the final structured discharge summary draft.

    Only called after all fact extraction, conflict detection, missing
    field checks, and escalation checks are complete.
    """

    name = "GENERATE_SUMMARY"

    def __init__(self, client: AsyncOpenAI) -> None:
        self._client = client
        self._settings = get_settings()

    async def run(self, state: AgentState, target: str | None = None) -> AgentState:
        warning_counts = {
            "missing": len(state.missing_fields),
            "conflict": len(state.conflicts),
            "pending": sum(1 for w in state.escalations if w.type == "pending"),
            "escalation": sum(1 for w in state.escalations if w.type == "escalation"),
        }
        total_flags = sum(warning_counts.values())

        state.add_trace(
            phase="Finalize Draft",
            reasoning=(
                f"All checks complete. {total_flags} total flag(s) identified: "
                f"{warning_counts['missing']} missing, "
                f"{warning_counts['conflict']} conflicts, "
                f"{warning_counts['pending']} pending, "
                f"{warning_counts['escalation']} escalations. "
                "Generating structured summary draft. "
                "Every missing field will be explicitly labeled — nothing will be invented."
            ),
            action="GENERATE_SUMMARY",
            inputs={
                "total_flags": total_flags,
                "warning_counts": warning_counts,
            },
            result="Calling LLM to compile summary...",
            result_type="info",
        )

        try:
            context = self._build_context(state)
            summary = await self._call_with_retry(context)

            # Inject correct metadata
            summary["metadata"] = {
                "is_draft": True,
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "total_flags": total_flags,
                "warning_counts": warning_counts,
                "run_id": state.run_id,
                "documents_processed": len(state.documents_read),
                "documents_failed": len(state.failed_documents),
            }

            state.summary_draft = summary
            state.summary_generated = True

            section_count = len(summary.get("sections", []))
            state.trace_log[-1].result = (
                f"Summary draft generated. {section_count} sections, "
                f"{total_flags} flagged item(s). "
                "Status: DRAFT — Requires clinician review before finalization."
            )
            state.trace_log[-1].result_type = "success"

            log.info("summary_generator.done", flags=total_flags, sections=section_count)

        except Exception as exc:
            log.error("summary_generator.failed", error=str(exc))
            state.summary_draft = self._fallback_summary(state, str(exc))
            state.summary_generated = True
            state.trace_log[-1].result = (
                f"Summary generation FAILED: {exc}. "
                "A minimal fallback summary has been produced. "
                "Clinician should reconstruct manually from source documents."
            )
            state.trace_log[-1].result_type = "error"
            state.trace_log[-1].status = "error"

        return state

    @retry(
        stop=stop_after_attempt(2),
        wait=wait_fixed(3),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    async def _call_with_retry(self, context: str) -> dict:
        response = await self._client.chat.completions.create(
            model=self._settings.openai_model,
            messages=[
                {"role": "system", "content": SUMMARY_GENERATION_SYSTEM},
                {"role": "user", "content": context},
            ],
            response_format={"type": "json_object"},
            temperature=0,
            timeout=self._settings.openai_timeout,
        )
        raw = response.choices[0].message.content or "{}"
        return json.loads(raw)

    def _build_context(self, state: AgentState) -> str:
        sections = [
            "=== EXTRACTED FACTS ===",
            json.dumps(state.extracted_facts, indent=2),
            "",
            "=== CONFLICTS DETECTED ===",
            json.dumps([c.to_dict() for c in state.conflicts], indent=2),
            "",
            "=== MISSING FIELDS ===",
            json.dumps([m.to_dict() for m in state.missing_fields], indent=2),
            "",
            "=== ESCALATIONS ===",
            json.dumps([e.to_dict() for e in state.escalations], indent=2),
        ]
        return "\n".join(sections)

    @staticmethod
    def _fallback_summary(state: AgentState, error: str) -> dict:
        return {
            "metadata": {
                "is_draft": True,
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "total_flags": len(state.all_warnings),
                "generation_error": error,
                "run_id": state.run_id,
            },
            "sections": [
                {
                    "id": "error",
                    "title": "Summary Generation Error",
                    "fields": [
                        {
                            "label": "Status",
                            "value": f"Summary could not be generated: {error}",
                            "status": "missing",
                        }
                    ],
                }
            ],
            "medications": [],
        }

from __future__ import annotations

import json

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type

from app.agent.state import AgentState, AgentWarning
from app.agent.prompts import CONFLICT_DETECTION_SYSTEM
from app.config import get_settings
from app.tools.base import BaseTool
from app.utils.logger import get_logger

log = get_logger(__name__)


class ConflictDetectorTool(BaseTool):
    """Cross-document conflict detection.

    Sends all extracted facts to the LLM and asks it to identify any fields
    where two or more documents disagree. Never auto-resolves — only flags.
    """

    name = "CHECK_CONFLICTS"

    def __init__(self, client: AsyncOpenAI) -> None:
        self._client = client
        self._settings = get_settings()

    async def run(self, state: AgentState, target: str | None = None) -> AgentState:
        if not state.extracted_facts:
            state.add_trace(
                phase="Conflict Detection",
                reasoning="No extracted facts available to compare. Skipping conflict check.",
                action="CHECK_CONFLICTS",
                inputs={},
                result="Skipped: no facts to compare.",
                result_type="info",
            )
            state.conflict_check_done = True
            return state

        doc_count = len(state.extracted_facts)
        state.add_trace(
            phase="Conflict Detection",
            reasoning=(
                f"Comparing extracted facts across {doc_count} document(s). "
                "Any field where two documents provide different values will be flagged. "
                "Conflicts will NOT be auto-resolved — they require clinician review."
            ),
            action="CHECK_CONFLICTS",
            inputs={"document_count": doc_count, "doc_ids": list(state.extracted_facts.keys())},
            result="Calling LLM...",
            result_type="info",
        )

        try:
            facts_payload = self._build_facts_payload(state)
            conflicts_raw = await self._call_with_retry(facts_payload)

            found: list[AgentWarning] = []
            for c in conflicts_raw:
                found.append(
                    AgentWarning(
                        type="conflict",
                        severity=c.get("severity", "high"),
                        field=c.get("field", "unknown"),
                        message=c.get("message", ""),
                        sources=c.get("sources"),
                        requires_decision=True,
                    )
                )
            state.conflicts = found

            result_msg = (
                f"Found {len(found)} conflict(s) across documents."
                if found
                else "No conflicts detected across documents."
            )
            state.trace_log[-1].result = result_msg
            state.trace_log[-1].result_type = "warning" if found else "success"
            state.conflict_check_done = True

            log.info("conflict_detector.done", conflicts=len(found))

        except Exception as exc:
            log.error("conflict_detector.failed", error=str(exc))
            state.trace_log[-1].result = (
                f"Conflict detection FAILED: {exc}. "
                "Proceeding without conflict data — clinician should review manually."
            )
            state.trace_log[-1].result_type = "error"
            state.trace_log[-1].status = "error"
            state.conflict_check_done = True  # Mark done to avoid infinite loop

        return state

    @retry(
        stop=stop_after_attempt(2),
        wait=wait_fixed(2),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    async def _call_with_retry(self, facts_payload: str) -> list[dict]:
        response = await self._client.chat.completions.create(
            model=self._settings.openai_model,
            messages=[
                {"role": "system", "content": CONFLICT_DETECTION_SYSTEM},
                {"role": "user", "content": f"Extracted facts from all documents:\n\n{facts_payload}"},
            ],
            response_format={"type": "json_object"},
            temperature=0,
            timeout=self._settings.openai_timeout,
        )
        raw = response.choices[0].message.content or "[]"
        parsed = json.loads(raw)
        # Handle both {"conflicts": [...]} and bare [...]
        if isinstance(parsed, list):
            return parsed
        return parsed.get("conflicts", parsed.get("items", []))

    @staticmethod
    def _build_facts_payload(state: AgentState) -> str:
        parts = []
        for doc_id, facts in state.extracted_facts.items():
            meta = state.document_meta.get(doc_id, {})
            label = f"Document: {meta.get('filename', doc_id)} (type: {facts.get('document_type', 'unknown')})"
            parts.append(f"{label}\n{json.dumps(facts, indent=2)}")
        return "\n\n---\n\n".join(parts)

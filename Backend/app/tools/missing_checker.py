from __future__ import annotations

import json

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type

from app.agent.state import AgentState, AgentWarning
from app.agent.prompts import MISSING_FIELDS_SYSTEM
from app.config import get_settings
from app.tools.base import BaseTool
from app.utils.logger import get_logger

log = get_logger(__name__)


class MissingCheckerTool(BaseTool):
    """Identifies required discharge summary fields absent from all documents.

    Only flags a field as MISSING if it truly has no documented value
    in any of the source documents.
    """

    name = "FLAG_MISSING"

    def __init__(self, client: AsyncOpenAI) -> None:
        self._client = client
        self._settings = get_settings()

    async def run(self, state: AgentState, target: str | None = None) -> AgentState:
        if not state.extracted_facts:
            state.add_trace(
                phase="Missing Field Check",
                reasoning="No extracted facts to audit. Skipping.",
                action="FLAG_MISSING",
                inputs={},
                result="Skipped: no facts available.",
                result_type="info",
            )
            state.missing_check_done = True
            return state

        state.add_trace(
            phase="Missing Field Check",
            reasoning=(
                "Auditing merged facts against the required discharge summary field list. "
                "A field is only marked MISSING if it has no documented value in any source document."
            ),
            action="FLAG_MISSING",
            inputs={"documents_checked": len(state.extracted_facts)},
            result="Calling LLM...",
            result_type="info",
        )

        try:
            merged = self._merge_facts(state)
            result_raw = await self._call_with_retry(json.dumps(merged, indent=2))

            missing: list[AgentWarning] = []
            for f in result_raw.get("missing_fields", []):
                missing.append(
                    AgentWarning(
                        type="missing",
                        severity=f.get("severity", "high"),
                        field=f.get("field", "unknown"),
                        message=f.get("message", ""),
                    )
                )

            pending: list[AgentWarning] = []
            for p in result_raw.get("pending_items", []):
                pending.append(
                    AgentWarning(
                        type="pending",
                        severity=p.get("severity", "medium"),
                        field=p.get("field", "unknown"),
                        message=p.get("message", ""),
                    )
                )

            state.missing_fields = missing
            # Pending items go into escalations so they surface in warnings
            state.escalations.extend(pending)

            total = len(missing) + len(pending)
            state.trace_log[-1].result = (
                f"Found {len(missing)} missing field(s) and {len(pending)} pending item(s)."
                if total
                else "All required fields are documented."
            )
            state.trace_log[-1].result_type = "warning" if total else "success"
            state.missing_check_done = True

            log.info("missing_checker.done", missing=len(missing), pending=len(pending))

        except Exception as exc:
            log.error("missing_checker.failed", error=str(exc))
            state.trace_log[-1].result = (
                f"Missing field check FAILED: {exc}. "
                "Proceeding — clinician should verify completeness manually."
            )
            state.trace_log[-1].result_type = "error"
            state.trace_log[-1].status = "error"
            state.missing_check_done = True

        return state

    @retry(
        stop=stop_after_attempt(2),
        wait=wait_fixed(2),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    async def _call_with_retry(self, merged_facts_json: str) -> dict:
        response = await self._client.chat.completions.create(
            model=self._settings.openai_model,
            messages=[
                {"role": "system", "content": MISSING_FIELDS_SYSTEM},
                {
                    "role": "user",
                    "content": f"Merged facts from all documents:\n\n{merged_facts_json}",
                },
            ],
            response_format={"type": "json_object"},
            temperature=0,
            timeout=self._settings.openai_timeout,
        )
        raw = response.choices[0].message.content or "{}"
        return json.loads(raw)

    @staticmethod
    def _merge_facts(state: AgentState) -> dict:
        """Merge all extracted facts into a single view.

        For each field, if multiple documents have non-null values,
        record all of them so the LLM can see what IS present.
        """
        merged: dict = {}
        for doc_id, facts in state.extracted_facts.items():
            meta = state.document_meta.get(doc_id, {})
            label = meta.get("filename", doc_id)
            for key, value in facts.items():
                if value in (None, [], "", "_extraction_error"):
                    continue
                if key not in merged:
                    merged[key] = {}
                merged[key][label] = value
        return merged

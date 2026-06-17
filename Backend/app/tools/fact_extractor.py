from __future__ import annotations

import json

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type

from app.agent.state import AgentState
from app.agent.prompts import FACT_EXTRACTION_SYSTEM
from app.config import get_settings
from app.tools.base import BaseTool
from app.utils.logger import get_logger

log = get_logger(__name__)


class FactExtractorTool(BaseTool):
    """Uses the LLM to extract structured clinical facts from document text.

    Guardrail: the prompt explicitly instructs the LLM to return null for
    absent fields rather than guessing.
    """

    name = "EXTRACT_FACTS"

    def __init__(self, client: AsyncOpenAI) -> None:
        self._client = client
        self._settings = get_settings()

    async def run(self, state: AgentState, target: str | None = None) -> AgentState:
        doc_id = target
        if not doc_id:
            state.add_trace(
                phase="Extract Facts",
                reasoning="EXTRACT_FACTS called with no target document.",
                action="EXTRACT_FACTS",
                inputs={},
                result="ERROR: No document ID provided.",
                result_type="error",
                status="error",
            )
            return state

        text = state.document_texts.get(doc_id)
        meta = state.document_meta.get(doc_id, {})
        filename = meta.get("filename", doc_id)

        if not text:
            state.add_trace(
                phase="Extract Facts",
                reasoning=f"No text available for document {doc_id}.",
                action="EXTRACT_FACTS",
                inputs={"doc_id": doc_id},
                result="ERROR: Document text not available. Cannot extract facts.",
                result_type="error",
                status="error",
            )
            return state

        state.add_trace(
            phase="Extract Facts",
            reasoning=(
                f"Sending '{filename}' to LLM for structured fact extraction. "
                "LLM is instructed to return null for any field not explicitly present — "
                "not to guess or infer."
            ),
            action="EXTRACT_FACTS",
            inputs={"doc_id": doc_id, "filename": filename, "text_length": len(text)},
            result="Calling LLM...",
            result_type="info",
        )

        try:
            facts = await self._call_with_retry(text, filename)
            state.extracted_facts[doc_id] = facts

            doc_type = facts.get("document_type", "unknown")
            non_null = sum(1 for v in facts.values() if v not in (None, [], ""))
            state.trace_log[-1].result = (
                f"Extracted facts from '{filename}' (type: {doc_type}). "
                f"{non_null} non-empty fields found."
            )
            state.trace_log[-1].result_type = "success"

            # If all docs now have facts, mark gate
            if not state.docs_pending_extraction:
                state.fact_extraction_done = True

            log.info("fact_extractor.success", doc_id=doc_id, doc_type=doc_type)

        except Exception as exc:
            log.error("fact_extractor.failed", doc_id=doc_id, error=str(exc))
            state.extracted_facts[doc_id] = {"_extraction_error": str(exc)}
            state.trace_log[-1].result = (
                f"FAILED to extract facts from '{filename}': {exc}. "
                "Document will be marked as extraction error."
            )
            state.trace_log[-1].result_type = "error"
            state.trace_log[-1].status = "error"

        return state

    @retry(
        stop=stop_after_attempt(2),
        wait=wait_fixed(2),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    async def _call_with_retry(self, text: str, filename: str) -> dict:
        truncated = text[:12000]  # Keep within context limits for large docs
        response = await self._client.chat.completions.create(
            model=self._settings.openai_model,
            messages=[
                {"role": "system", "content": FACT_EXTRACTION_SYSTEM},
                {
                    "role": "user",
                    "content": (
                        f"Document filename: {filename}\n\n"
                        f"Document text:\n{truncated}"
                    ),
                },
            ],
            response_format={"type": "json_object"},
            temperature=0,
            timeout=self._settings.openai_timeout,
        )
        raw = response.choices[0].message.content or "{}"
        return json.loads(raw)

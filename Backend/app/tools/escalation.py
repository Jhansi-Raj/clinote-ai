from __future__ import annotations

import json

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type

from app.agent.state import AgentState, AgentWarning
from app.agent.prompts import ESCALATION_DETECTION_SYSTEM
from app.config import get_settings
from app.tools.base import BaseTool
from app.utils.logger import get_logger

log = get_logger(__name__)


class EscalationTool(BaseTool):
    """Scans medications and clinical facts for safety concerns.

    Detected concerns are added to state.escalations and surface
    in the warnings panel as 'escalation' type, always with
    requires_decision=True.
    """

    name = "ESCALATE"

    def __init__(self, client: AsyncOpenAI) -> None:
        self._client = client
        self._settings = get_settings()

    async def run(self, state: AgentState, target: str | None = None) -> AgentState:
        if not state.extracted_facts:
            state.add_trace(
                phase="Escalation Check",
                reasoning="No extracted facts available for safety review.",
                action="ESCALATE",
                inputs={},
                result="Skipped: no facts available.",
                result_type="info",
            )
            return state

        all_meds: list[dict] = []
        for facts in state.extracted_facts.values():
            all_meds.extend(facts.get("discharge_medications", []) or [])
            all_meds.extend(facts.get("admission_medications", []) or [])

        if not all_meds:
            state.add_trace(
                phase="Escalation Check",
                reasoning="No medications found in extracted facts. Skipping drug interaction check.",
                action="ESCALATE",
                inputs={},
                result="No medications to review.",
                result_type="info",
            )
            return state

        state.add_trace(
            phase="Escalation Check",
            reasoning=(
                f"Reviewing {len(all_meds)} medication entries and clinical facts "
                "for drug-drug interactions and undocumented clinical concerns. "
                "Any flagged item will require mandatory clinician review — "
                "the agent will NOT make clinical decisions."
            ),
            action="ESCALATE",
            inputs={"medication_count": len(all_meds), "target": target},
            result="Calling drug interaction / safety check...",
            result_type="info",
        )

        try:
            clinical_snapshot = {
                "medications": all_meds,
                "diagnoses": self._collect_diagnoses(state),
                "allergies": self._collect_allergies(state),
            }
            concerns_raw = await self._call_with_retry(json.dumps(clinical_snapshot, indent=2))

            new_escalations: list[AgentWarning] = [
                AgentWarning(
                    type="escalation",
                    severity=c.get("severity", "high"),
                    field=c.get("field", "Safety Concern"),
                    message=c.get("message", ""),
                    requires_decision=True,
                )
                for c in concerns_raw
            ]

            # Avoid duplicates with already-logged escalations
            existing_fields = {e.field for e in state.escalations}
            fresh = [e for e in new_escalations if e.field not in existing_fields]
            state.escalations.extend(fresh)

            state.trace_log[-1].result = (
                f"Escalation check complete. {len(fresh)} new safety concern(s) flagged."
                if fresh
                else "No new safety concerns detected."
            )
            state.trace_log[-1].result_type = "error" if fresh else "success"

            log.info("escalation.done", new_escalations=len(fresh))

        except Exception as exc:
            log.error("escalation.failed", error=str(exc))
            state.trace_log[-1].result = (
                f"Escalation check FAILED: {exc}. "
                "Clinician should manually review medications for interactions."
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
    async def _call_with_retry(self, clinical_json: str) -> list[dict]:
        response = await self._client.chat.completions.create(
            model=self._settings.openai_model,
            messages=[
                {"role": "system", "content": ESCALATION_DETECTION_SYSTEM},
                {"role": "user", "content": f"Clinical data for review:\n\n{clinical_json}"},
            ],
            response_format={"type": "json_object"},
            temperature=0,
            timeout=self._settings.openai_timeout,
        )
        raw = response.choices[0].message.content or "[]"
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return parsed
        return parsed.get("concerns", parsed.get("items", parsed.get("escalations", [])))

    @staticmethod
    def _collect_diagnoses(state: AgentState) -> list[str]:
        diags: list[str] = []
        for facts in state.extracted_facts.values():
            if facts.get("principal_diagnosis"):
                diags.append(facts["principal_diagnosis"])
            diags.extend(facts.get("secondary_diagnoses") or [])
        return list(set(filter(None, diags)))

    @staticmethod
    def _collect_allergies(state: AgentState) -> list[str]:
        allergies: list[str] = []
        for facts in state.extracted_facts.values():
            allergies.extend(facts.get("allergies") or [])
        return list(set(filter(None, allergies)))

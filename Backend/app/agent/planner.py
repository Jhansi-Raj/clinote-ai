from __future__ import annotations

import json
from dataclasses import dataclass

from openai import AsyncOpenAI

from app.agent.state import AgentAction, AgentState
from app.agent.prompts import PLANNER_SYSTEM
from app.config import get_settings
from app.utils.logger import get_logger

log = get_logger(__name__)


@dataclass
class PlanDecision:
    action: AgentAction
    reasoning: str
    target: str | None = None


class Planner:
    """Decides the next agent action.

    Uses the LLM for intelligent planning. Falls back to a deterministic
    ordered sequence if the LLM call fails, ensuring the agent always
    makes progress regardless.
    """

    def __init__(self, client: AsyncOpenAI) -> None:
        self._client = client
        self._settings = get_settings()

    async def decide(self, state: AgentState) -> PlanDecision:
        try:
            return await self._llm_decide(state)
        except Exception as exc:
            log.warning("planner.llm_failed", error=str(exc), run_id=state.run_id)
            return self._deterministic_decide(state)

    async def _llm_decide(self, state: AgentState) -> PlanDecision:
        user_msg = f"Current agent state:\n\n{state.state_summary()}"

        response = await self._client.chat.completions.create(
            model=self._settings.openai_model,
            messages=[
                {"role": "system", "content": PLANNER_SYSTEM},
                {"role": "user", "content": user_msg},
            ],
            response_format={"type": "json_object"},
            temperature=0,
            timeout=self._settings.openai_timeout,
        )

        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)

        action_str = parsed.get("action", "STOP")
        try:
            action = AgentAction(action_str)
        except ValueError:
            log.warning("planner.unknown_action", action=action_str)
            return self._deterministic_decide(state)

        return PlanDecision(
            action=action,
            reasoning=parsed.get("reasoning", "LLM planner decision"),
            target=parsed.get("target"),
        )

    def _deterministic_decide(self, state: AgentState) -> PlanDecision:
        """Ordered fallback planner — guarantees forward progress."""

        # 1. Read any unread document
        unread = [
            d for d in state.document_ids
            if d not in state.documents_read and d not in state.failed_documents
        ]
        if unread:
            return PlanDecision(
                action=AgentAction.READ_PDF,
                reasoning=f"Document {unread[0]} has not been read yet.",
                target=unread[0],
            )

        # 2. Extract facts from read docs that have none yet
        pending_extract = state.docs_pending_extraction
        if pending_extract:
            return PlanDecision(
                action=AgentAction.EXTRACT_FACTS,
                reasoning=f"Document {pending_extract[0]} has been read but facts not extracted.",
                target=pending_extract[0],
            )

        # 3. Conflict check
        if not state.conflict_check_done and state.extracted_facts:
            return PlanDecision(
                action=AgentAction.CHECK_CONFLICTS,
                reasoning="All facts extracted; need to check for conflicts across documents.",
            )

        # 4. Missing field check
        if not state.missing_check_done and state.extracted_facts:
            return PlanDecision(
                action=AgentAction.FLAG_MISSING,
                reasoning="Conflict check complete; need to identify missing required fields.",
            )

        # 5. Generate summary
        if not state.summary_generated:
            return PlanDecision(
                action=AgentAction.GENERATE_SUMMARY,
                reasoning="All checks complete. Generating structured summary draft.",
            )

        return PlanDecision(
            action=AgentAction.STOP,
            reasoning="Summary generated. Loop complete.",
        )

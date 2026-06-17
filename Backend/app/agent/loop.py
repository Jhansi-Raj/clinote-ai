from __future__ import annotations

from openai import AsyncOpenAI

from app.agent.planner import Planner
from app.agent.state import AgentAction, AgentState
from app.config import get_settings
from app.tools.base import BaseTool
from app.tools.conflict_detector import ConflictDetectorTool
from app.tools.escalation import EscalationTool
from app.tools.fact_extractor import FactExtractorTool
from app.tools.missing_checker import MissingCheckerTool
from app.tools.pdf_reader import PDFReaderTool
from app.tools.summary_generator import SummaryGeneratorTool
from app.utils.logger import get_logger

log = get_logger(__name__)


class AgentLoop:
    """The main agent loop.

    On each iteration:
    1. Check hard stop conditions.
    2. Ask the Planner for the next action.
    3. Dispatch to the appropriate Tool.
    4. Update state and log trace.

    The loop is NOT a hardcoded sequence. The Planner uses the LLM to
    decide the next action based on the current state.
    """

    def __init__(
        self,
        state: AgentState,
        document_map: dict[str, dict],
    ) -> None:
        self._state = state
        self._settings = get_settings()

        client = AsyncOpenAI(api_key=self._settings.openai_api_key)
        self._planner = Planner(client)
        self._tools: dict[AgentAction, BaseTool] = {
            AgentAction.READ_PDF: PDFReaderTool(document_map),
            AgentAction.EXTRACT_FACTS: FactExtractorTool(client),
            AgentAction.CHECK_CONFLICTS: ConflictDetectorTool(client),
            AgentAction.FLAG_MISSING: MissingCheckerTool(client),
            AgentAction.ESCALATE: EscalationTool(client),
            AgentAction.GENERATE_SUMMARY: SummaryGeneratorTool(client),
        }

    async def run(self) -> AgentState:
        log.info(
            "agent_loop.start",
            run_id=self._state.run_id,
            documents=len(self._state.document_ids),
            max_steps=self._state.max_steps,
        )

        self._state.add_trace(
            phase="Initialize",
            reasoning=(
                f"Agent initialized for run {self._state.run_id}. "
                f"{len(self._state.document_ids)} document(s) to process. "
                f"Max steps: {self._state.max_steps}. "
                "Planning execution: read PDFs → extract facts → detect conflicts "
                "→ flag missing → escalation check → generate summary."
            ),
            action="INITIALIZE",
            inputs={
                "run_id": self._state.run_id,
                "document_count": len(self._state.document_ids),
                "max_steps": self._state.max_steps,
            },
            result="Agent initialized. Starting planning loop.",
            result_type="info",
        )

        while not self._should_stop():
            plan = await self._planner.decide(self._state)

            log.info(
                "agent_loop.step",
                step=self._state.step_count,
                action=plan.action,
                target=plan.target,
            )

            if plan.action == AgentAction.STOP:
                self._state.add_trace(
                    phase="Stop",
                    reasoning=plan.reasoning,
                    action="STOP",
                    inputs={},
                    result="Agent loop complete.",
                    result_type="success",
                )
                break

            tool = self._tools.get(plan.action)
            if not tool:
                log.warning("agent_loop.unknown_action", action=plan.action)
                continue

            self._state = await tool.run(self._state, target=plan.target)

            # After fact extraction is complete, run escalation check once
            if (
                plan.action == AgentAction.FLAG_MISSING
                and self._state.missing_check_done
                and not any(
                    step.action == "ESCALATE" for step in self._state.trace_log
                )
            ):
                escalation_tool = self._tools[AgentAction.ESCALATE]
                self._state = await escalation_tool.run(self._state)

        await self._force_summary_if_needed()

        log.info(
            "agent_loop.complete",
            run_id=self._state.run_id,
            steps=self._state.step_count,
            warnings=len(self._state.all_warnings),
            summary_generated=self._state.summary_generated,
        )
        return self._state

    def _should_stop(self) -> bool:
        if self._state.summary_generated:
            return True

        if self._state.step_count >= self._state.max_steps:
            self._state.hard_stopped = True
            self._state.add_trace(
                phase="Hard Stop",
                reasoning=(
                    f"Agent reached the maximum step limit of {self._state.max_steps}. "
                    "Stopping to prevent infinite execution. "
                    "Any incomplete sections will be marked as unresolved."
                ),
                action="HARD_STOP",
                inputs={"step_count": self._state.step_count, "max_steps": self._state.max_steps},
                result=(
                    "Agent halted at step limit. "
                    "Summary may be incomplete — clinician should review source documents."
                ),
                result_type="error",
                status="error",
            )
            return True

        return False

    async def _force_summary_if_needed(self) -> None:
        """Called at loop exit to ensure a summary always exists."""
        if not self._state.summary_generated:
            gen_tool = self._tools[AgentAction.GENERATE_SUMMARY]
            self._state = await gen_tool.run(self._state)

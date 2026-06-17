from __future__ import annotations

from abc import ABC, abstractmethod

from app.agent.state import AgentState


class BaseTool(ABC):
    """All agent tools implement this contract."""

    name: str

    @abstractmethod
    async def run(self, state: AgentState, target: str | None = None) -> AgentState:
        """Execute the tool and update state in-place. Never raises — logs and continues."""
        ...

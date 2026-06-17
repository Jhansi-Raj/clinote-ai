from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from app.agent.loop import AgentLoop
from app.agent.state import AgentState
from app.api.models import AnalyzeRequest, AnalyzeResponse, ErrorResponse
from app.config import get_settings
from app.db.queries import get_documents_for_run, get_run, update_run
from app.utils.logger import get_logger

log = get_logger(__name__)
router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses={404: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
    summary="Start AI analysis for a run",
    description=(
        "Starts the agent loop for the given run_id. "
        "Returns immediately with status=processing. "
        "Poll GET /runs/{run_id} for the final result."
    ),
)
async def analyze(
    body: AnalyzeRequest,
    background_tasks: BackgroundTasks,
) -> AnalyzeResponse:
    run_id = body.run_id

    run = await get_run(run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run '{run_id}' not found.",
        )

    if run["status"] in ("processing", "completed"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Run '{run_id}' is already {run['status']}.",
        )

    documents = await get_documents_for_run(run_id)
    if not documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Run '{run_id}' has no documents. Upload files first.",
        )

    await update_run(run_id, {"status": "processing"})

    background_tasks.add_task(_run_agent, run_id, documents)

    log.info("analyze.queued", run_id=run_id, documents=len(documents))
    return AnalyzeResponse(run_id=run_id)


async def _run_agent(run_id: str, documents: list[dict]) -> None:
    settings = get_settings()

    document_ids = [d["id"] for d in documents]
    document_map = {
        d["id"]: {"filename": d["filename"], "storage_path": d["storage_path"]}
        for d in documents
    }

    state = AgentState(
        run_id=run_id,
        document_ids=document_ids,
        max_steps=settings.max_agent_steps,
    )

    try:
        loop = AgentLoop(state=state, document_map=document_map)
        final_state = await loop.run()

        await update_run(
            run_id,
            {
                "status": "completed",
                "summary_draft": final_state.summary_draft,
                "warnings": [w.to_dict() for w in final_state.all_warnings],
                "trace_log": [t.to_dict() for t in final_state.trace_log],
                "step_count": final_state.step_count,
            },
        )

        log.info(
            "analyze.completed",
            run_id=run_id,
            steps=final_state.step_count,
            warnings=len(final_state.all_warnings),
        )

    except Exception as exc:
        log.error("analyze.failed", run_id=run_id, error=str(exc))
        error_trace = [t.to_dict() for t in state.trace_log]
        await update_run(
            run_id,
            {
                "status": "failed",
                "error": str(exc),
                "trace_log": error_trace,
                "step_count": state.step_count,
            },
        )

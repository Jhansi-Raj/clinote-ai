from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.models import ErrorResponse, RunListItem, RunResult
from app.db.queries import get_documents_for_run, get_run, list_runs
from app.utils.logger import get_logger

log = get_logger(__name__)
router = APIRouter()


@router.get(
    "/runs",
    response_model=list[RunListItem],
    summary="List all analysis runs",
)
async def get_runs(limit: int = 50) -> list[RunListItem]:
    rows = await list_runs(limit=min(limit, 200))
    return [
        RunListItem(
            id=r["id"],
            status=r["status"],
            step_count=r.get("step_count", 0),
            created_at=str(r["created_at"]),
            updated_at=str(r["updated_at"]),
        )
        for r in rows
    ]


@router.get(
    "/runs/{run_id}",
    response_model=RunResult,
    responses={404: {"model": ErrorResponse}},
    summary="Get analysis result for a run",
    description=(
        "Returns the current status and, when completed, the full "
        "summary_draft, warnings, and trace for the run."
    ),
)
async def get_run_result(run_id: str) -> RunResult:
    run = await get_run(run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run '{run_id}' not found.",
        )

    return RunResult(
        run_id=run["id"],
        status=run["status"],
        summary_draft=run.get("summary_draft"),
        warnings=run.get("warnings") or [],
        trace=run.get("trace_log") or [],
        step_count=run.get("step_count") or 0,
        error=run.get("error"),
        created_at=str(run["created_at"]),
        updated_at=str(run["updated_at"]),
    )


@router.get(
    "/runs/{run_id}/documents",
    summary="List documents for a run",
)
async def get_run_documents(run_id: str) -> list[dict]:
    run = await get_run(run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run '{run_id}' not found.",
        )
    docs = await get_documents_for_run(run_id)
    return [
        {
            "id": d["id"],
            "filename": d["filename"],
            "size_bytes": d.get("size_bytes"),
            "created_at": str(d["created_at"]),
        }
        for d in docs
    ]

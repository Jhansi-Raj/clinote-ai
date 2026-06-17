from __future__ import annotations

import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.api.models import DocumentOut, ErrorResponse, UploadResponse
from app.config import get_settings
from app.db.queries import create_document, create_run, upload_to_storage
from app.utils.logger import get_logger

log = get_logger(__name__)
router = APIRouter()

_MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
_ALLOWED_CONTENT_TYPES = {"application/pdf", "application/octet-stream"}


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}, 422: {"model": ErrorResponse}},
    summary="Upload patient source documents",
    description=(
        "Upload one or more PDF files for a new analysis run. "
        "Returns a run_id to be used with POST /analyze."
    ),
)
async def upload_documents(
    files: list[UploadFile] = File(..., description="One or more PDF files"),
) -> UploadResponse:
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one file must be provided.",
        )

    settings = get_settings()

    # Validate files before touching the DB
    for f in files:
        if f.content_type not in _ALLOWED_CONTENT_TYPES and not (f.filename or "").endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{f.filename}' is not a PDF.",
            )

    # Create run
    run = await create_run()
    run_id: str = run["id"]

    log.info("upload.run_created", run_id=run_id, file_count=len(files))

    uploaded: list[DocumentOut] = []

    for file in files:
        content = await file.read()

        if len(content) > _MAX_FILE_SIZE:
            log.warning("upload.file_too_large", filename=file.filename, size=len(content))
            continue  # Skip oversized files rather than failing the whole request

        if len(content) == 0:
            log.warning("upload.empty_file", filename=file.filename)
            continue

        doc_id = str(uuid.uuid4())
        safe_name = (file.filename or f"{doc_id}.pdf").replace(" ", "_")
        storage_path = f"{run_id}/{doc_id}/{safe_name}"

        try:
            await upload_to_storage(
                bucket=settings.supabase_storage_bucket,
                path=storage_path,
                data=content,
            )

            doc = await create_document(
                run_id=run_id,
                filename=safe_name,
                storage_path=storage_path,
                size_bytes=len(content),
            )

            uploaded.append(
                DocumentOut(
                    id=doc["id"],
                    filename=safe_name,
                    size_bytes=len(content),
                )
            )

            log.info("upload.file_stored", doc_id=doc["id"], filename=safe_name)

        except Exception as exc:
            log.error("upload.file_failed", filename=file.filename, error=str(exc))
            # Continue uploading remaining files

    if not uploaded:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files could be uploaded. Check file formats and sizes.",
        )

    return UploadResponse(run_id=run_id, documents=uploaded)

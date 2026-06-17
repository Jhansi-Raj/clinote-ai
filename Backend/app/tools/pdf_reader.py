from __future__ import annotations

import asyncio
import io

import pdfplumber

from app.agent.state import AgentState
from app.config import get_settings
from app.db.queries import download_from_storage
from app.tools.base import BaseTool
from app.utils.logger import get_logger

log = get_logger(__name__)


class PDFReaderTool(BaseTool):
    """Downloads a PDF from Supabase Storage and extracts its full text."""

    name = "PDF_READER"

    def __init__(self, document_map: dict[str, dict]) -> None:
        """
        document_map: {doc_id: {"filename": str, "storage_path": str}}
        """
        self._document_map = document_map
        self._settings = get_settings()

    async def run(self, state: AgentState, target: str | None = None) -> AgentState:
        doc_id = target
        if not doc_id:
            state.add_trace(
                phase="Read PDF",
                reasoning="READ_PDF called with no target document ID.",
                action="READ_PDF",
                inputs={"target": None},
                result="ERROR: No document ID provided. Skipping.",
                result_type="error",
                status="error",
            )
            return state

        meta = self._document_map.get(doc_id)
        if not meta:
            state.add_trace(
                phase="Read PDF",
                reasoning=f"Document {doc_id} not found in document map.",
                action="READ_PDF",
                inputs={"doc_id": doc_id},
                result=f"ERROR: Unknown document ID {doc_id}.",
                result_type="error",
                status="error",
            )
            state.failed_documents.append(doc_id)
            return state

        filename = meta.get("filename", doc_id)
        storage_path = meta["storage_path"]

        state.add_trace(
            phase="Read PDF",
            reasoning=(
                f"Document '{filename}' has not been read yet. "
                "Downloading from storage and extracting text."
            ),
            action="READ_PDF",
            inputs={"doc_id": doc_id, "filename": filename, "storage_path": storage_path},
            result="Downloading...",
            result_type="info",
        )

        try:
            pdf_bytes = await download_from_storage(
                bucket=self._settings.supabase_storage_bucket,
                path=storage_path,
            )
            text = await asyncio.get_event_loop().run_in_executor(
                None, self._extract_text, pdf_bytes, filename
            )

            state.document_texts[doc_id] = text
            state.document_meta[doc_id] = meta
            state.documents_read.append(doc_id)

            # Patch last trace entry with real result
            state.trace_log[-1].result = (
                f"Successfully read '{filename}'. Extracted {len(text)} characters."
            )
            state.trace_log[-1].result_type = "success"

            log.info("pdf_reader.success", doc_id=doc_id, chars=len(text))

        except Exception as exc:
            log.error("pdf_reader.failed", doc_id=doc_id, error=str(exc))
            state.failed_documents.append(doc_id)
            state.trace_log[-1].result = (
                f"FAILED to read '{filename}': {exc}. "
                "Document will be skipped. Remaining documents will still be processed."
            )
            state.trace_log[-1].result_type = "error"
            state.trace_log[-1].status = "error"

        return state

    @staticmethod
    def _extract_text(pdf_bytes: bytes, filename: str) -> str:
        pages: list[str] = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    pages.append(f"[Page {i + 1}]\n{page_text.strip()}")
        if not pages:
            raise ValueError(f"No extractable text found in '{filename}'.")
        return "\n\n".join(pages)

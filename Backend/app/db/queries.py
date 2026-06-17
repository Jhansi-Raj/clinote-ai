from __future__ import annotations

import asyncio
from typing import Any
from uuid import UUID

from app.db.supabase_client import get_supabase
from app.utils.logger import get_logger

log = get_logger(__name__)


# ─────────────────────────────────────────────────────────────
# Runs
# ─────────────────────────────────────────────────────────────

async def create_run() -> dict:
    def _create():
        return get_supabase().table("runs").insert({"status": "pending"}).execute()

    loop = asyncio.get_event_loop()
    resp = await loop.run_in_executor(None, _create)
    return resp.data[0]


async def get_run(run_id: str) -> dict | None:
    def _get():
        return get_supabase().table("runs").select("*").eq("id", run_id).execute()

    loop = asyncio.get_event_loop()
    resp = await loop.run_in_executor(None, _get)
    return resp.data[0] if resp.data else None


async def update_run(run_id: str, payload: dict) -> None:
    def _update():
        return get_supabase().table("runs").update(payload).eq("id", run_id).execute()

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _update)


async def list_runs(limit: int = 50) -> list[dict]:
    def _list():
        return (
            get_supabase()
            .table("runs")
            .select("id, status, created_at, updated_at, step_count")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

    loop = asyncio.get_event_loop()
    resp = await loop.run_in_executor(None, _list)
    return resp.data


# ─────────────────────────────────────────────────────────────
# Documents
# ─────────────────────────────────────────────────────────────

async def create_document(run_id: str, filename: str, storage_path: str, size_bytes: int) -> dict:
    def _create():
        return get_supabase().table("documents").insert({
            "run_id": run_id,
            "filename": filename,
            "storage_path": storage_path,
            "size_bytes": size_bytes,
        }).execute()

    loop = asyncio.get_event_loop()
    resp = await loop.run_in_executor(None, _create)
    return resp.data[0]


async def get_documents_for_run(run_id: str) -> list[dict]:
    def _get():
        return (
            get_supabase()
            .table("documents")
            .select("*")
            .eq("run_id", run_id)
            .execute()
        )

    loop = asyncio.get_event_loop()
    resp = await loop.run_in_executor(None, _get)
    return resp.data


# ─────────────────────────────────────────────────────────────
# Storage
# ─────────────────────────────────────────────────────────────

async def upload_to_storage(bucket: str, path: str, data: bytes, content_type: str = "application/pdf") -> str:
    def _upload():
        return get_supabase().storage.from_(bucket).upload(
            path=path,
            file=data,
            file_options={"content-type": content_type, "upsert": "false"},
        )

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _upload)
    return path


async def download_from_storage(bucket: str, path: str) -> bytes:
    def _download():
        return get_supabase().storage.from_(bucket).download(path)

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _download)

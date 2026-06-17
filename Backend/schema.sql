-- Clinote AI — Supabase Schema
-- Run this in your Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- runs: one row per analysis job
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS runs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    summary_draft   JSONB,
    warnings        JSONB DEFAULT '[]'::jsonb,
    trace_log       JSONB DEFAULT '[]'::jsonb,
    error           TEXT,
    step_count      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- documents: one row per uploaded PDF per run
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id          UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    filename        TEXT NOT NULL,
    storage_path    TEXT NOT NULL,
    size_bytes      INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_run_id ON documents(run_id);

-- ──────────────────────────────────────────────
-- Auto-update updated_at on runs
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_runs_updated_at
    BEFORE UPDATE ON runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────
-- Storage bucket (run manually or via Supabase dashboard)
-- ──────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('clinote-documents', 'clinote-documents', false);

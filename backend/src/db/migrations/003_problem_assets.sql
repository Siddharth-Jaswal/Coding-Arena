-- backend/src/db/migrations/003_problem_assets.sql

CREATE TABLE problem_assets (
    problem_id BIGINT PRIMARY KEY REFERENCES problems(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    file_id TEXT,
    checksum TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    archive_size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_provider CHECK (provider = 'GOOGLE_DRIVE')
);

CREATE TRIGGER trg_problem_assets_updated_at
BEFORE UPDATE ON problem_assets
FOR EACH ROW
EXECUTE FUNCTION update_problems_updated_at_column();

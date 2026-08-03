-- backend/src/db/migrations/002_problem_bank_schema.sql

-- 1. Alter problems table to remove old constraint and rename description
ALTER TABLE problems DROP CONSTRAINT IF EXISTS chk_difficulty;
ALTER TABLE problems RENAME COLUMN description TO statement;

-- 2. Add new columns to problems table
ALTER TABLE problems
    ADD COLUMN slug TEXT UNIQUE,
    ADD COLUMN input_format TEXT,
    ADD COLUMN output_format TEXT,
    ADD COLUMN constraints TEXT[],
    ADD COLUMN tags TEXT[],
    ADD COLUMN time_limit_ms INTEGER,
    ADD COLUMN memory_limit_mb INTEGER,
    ADD COLUMN version INTEGER DEFAULT 1,
    ADD COLUMN checksum TEXT,
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Create updated_at trigger function for problems table
CREATE OR REPLACE FUNCTION update_problems_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_problems_updated_at
BEFORE UPDATE ON problems
FOR EACH ROW
EXECUTE FUNCTION update_problems_updated_at_column();

-- 4. Create test_cases table
CREATE TABLE test_cases (
    id BIGSERIAL PRIMARY KEY,
    problem_id BIGINT REFERENCES problems(id) ON DELETE CASCADE,
    case_order INTEGER NOT NULL,
    input_data TEXT NOT NULL,
    output_data TEXT NOT NULL,
    visibility TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_visibility CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
    CONSTRAINT uq_problem_case UNIQUE(problem_id, visibility, case_order)
);

-- 5. Create indexes
CREATE INDEX idx_test_cases_problem ON test_cases(problem_id);
CREATE INDEX idx_test_cases_visibility ON test_cases(problem_id, visibility);

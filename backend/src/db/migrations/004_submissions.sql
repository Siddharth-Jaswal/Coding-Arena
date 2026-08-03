DROP TABLE IF EXISTS submissions CASCADE;

CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    problem_id BIGINT REFERENCES problems(id),
    language TEXT,
    source_code TEXT,
    status TEXT DEFAULT 'queued',
    verdict TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ NULL,
    finished_at TIMESTAMPTZ NULL
);

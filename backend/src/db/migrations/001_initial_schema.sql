CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE problems (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    problem_id BIGINT REFERENCES problems(id) ON DELETE CASCADE,
    language VARCHAR(30) NOT NULL,
    source_code TEXT NOT NULL,
    verdict VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_verdict CHECK (verdict IN ('pending', 'accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded', 'compilation_error'))
);

CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);

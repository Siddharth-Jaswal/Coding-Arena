ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS execution_time_ms INTEGER;

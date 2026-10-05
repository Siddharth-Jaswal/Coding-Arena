CREATE TABLE IF NOT EXISTS friendships (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "requesterId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "receiverId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_friendship UNIQUE ("requesterId", "receiverId")
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships("requesterId");
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON friendships("receiverId");

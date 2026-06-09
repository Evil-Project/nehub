ALTER TABLE users ADD COLUMN suspended_at TEXT;
ALTER TABLE users ADD COLUMN suspended_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_users_suspended_at ON users(suspended_at);

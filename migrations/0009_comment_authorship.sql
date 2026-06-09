ALTER TABLE comments ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE comments ADD COLUMN parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN updated_at TEXT;
ALTER TABLE comments ADD COLUMN deleted_at TEXT;

CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);

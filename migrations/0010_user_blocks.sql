CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_user_id
  ON user_blocks(blocked_user_id);

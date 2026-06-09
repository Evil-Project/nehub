CREATE TABLE IF NOT EXISTS user_muted_tags (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_user_muted_tags_tag
  ON user_muted_tags(tag, user_id);

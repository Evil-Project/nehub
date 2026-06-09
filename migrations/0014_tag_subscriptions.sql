CREATE TABLE IF NOT EXISTS tag_subscriptions (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_tag_subscriptions_tag
  ON tag_subscriptions(tag);

CREATE TABLE IF NOT EXISTS reading_progress (
  user_id TEXT NOT NULL,
  novel_id TEXT NOT NULL,
  last_position INTEGER NOT NULL DEFAULT 0,
  scroll_percent REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, novel_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reading_progress_user_updated
  ON reading_progress(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_novels_discovery_likes
  ON novels(like_count DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_novels_discovery_bookmarks
  ON novels(bookmark_count DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_novels_discovery_views
  ON novels(view_count DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_novels_discovery_word_count
  ON novels(word_count DESC, created_at DESC);

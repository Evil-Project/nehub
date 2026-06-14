CREATE TABLE IF NOT EXISTS favorite_novels (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, novel_id)
);

CREATE INDEX IF NOT EXISTS idx_favorite_novels_user_created
  ON favorite_novels(user_id, created_at DESC, novel_id);

CREATE INDEX IF NOT EXISTS idx_favorite_novels_novel_created
  ON favorite_novels(novel_id, created_at DESC, user_id);

CREATE TABLE IF NOT EXISTS novel_likes (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, novel_id)
);

CREATE INDEX IF NOT EXISTS idx_novel_likes_novel_created
  ON novel_likes(novel_id, created_at DESC, user_id);

CREATE TABLE IF NOT EXISTS novel_comments (
  id TEXT PRIMARY KEY,
  novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  parent_comment_id TEXT REFERENCES novel_comments(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_novel_comments_novel_created
  ON novel_comments(novel_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_novel_comments_parent
  ON novel_comments(parent_comment_id, created_at ASC);

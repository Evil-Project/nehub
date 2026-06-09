CREATE TABLE IF NOT EXISTS artwork_likes (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, artwork_id)
);

CREATE INDEX IF NOT EXISTS idx_artwork_likes_artwork
  ON artwork_likes(artwork_id, created_at DESC);

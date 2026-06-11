ALTER TABLE users
  ADD COLUMN storage_bonus_credits INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users
  ADD COLUMN storage_last_login_credit_date TEXT;

CREATE TABLE IF NOT EXISTS artwork_like_credit_awards (
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  liker_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (artwork_id, liker_user_id)
);

CREATE INDEX IF NOT EXISTS idx_artwork_like_credit_awards_creator
  ON artwork_like_credit_awards(creator_user_id, created_at DESC);

UPDATE users
SET storage_bonus_credits = (
  SELECT CASE
    WHEN COUNT(artwork_images.id) > 10 THEN COUNT(artwork_images.id) - 10
    ELSE 0
  END
  FROM artworks
  JOIN artwork_images ON artwork_images.artwork_id = artworks.id
  WHERE artworks.creator_id = users.id
)
WHERE storage_bonus_credits = 0;

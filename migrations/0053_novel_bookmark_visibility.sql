ALTER TABLE favorite_novels ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private';

CREATE INDEX IF NOT EXISTS idx_favorite_novels_user_visibility_created
  ON favorite_novels(user_id, visibility, created_at DESC, novel_id);

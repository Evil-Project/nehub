ALTER TABLE artworks
  ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'unlisted', 'private'));

CREATE INDEX IF NOT EXISTS idx_artworks_visibility_created_at
  ON artworks(visibility, hidden_at, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_artworks_creator_visibility_created_at
  ON artworks(creator_id, visibility, hidden_at, created_at DESC, id DESC);

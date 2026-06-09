ALTER TABLE collections ADD COLUMN cover_artwork_id TEXT;

CREATE INDEX IF NOT EXISTS idx_collections_cover_artwork_id
  ON collections(cover_artwork_id);

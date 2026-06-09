CREATE TABLE IF NOT EXISTS artwork_series (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'private',
  cover_artwork_id TEXT REFERENCES artworks(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artwork_series_items (
  series_id TEXT NOT NULL REFERENCES artwork_series(id) ON DELETE CASCADE,
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (series_id, artwork_id)
);

CREATE INDEX IF NOT EXISTS idx_artwork_series_creator_visibility
  ON artwork_series(creator_id, visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artwork_series_updated
  ON artwork_series(updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_artwork_series_cover_artwork_id
  ON artwork_series(cover_artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_series_items_series_position
  ON artwork_series_items(series_id, position, artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_series_items_artwork_id
  ON artwork_series_items(artwork_id);

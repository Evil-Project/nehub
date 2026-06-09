CREATE INDEX IF NOT EXISTS idx_artworks_visible_latest
  ON artworks(hidden_at, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_artworks_visible_rating_latest
  ON artworks(hidden_at, mature_rating, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_artworks_visible_mature_latest
  ON artworks(hidden_at, mature, mature_rating, created_at DESC, id DESC);

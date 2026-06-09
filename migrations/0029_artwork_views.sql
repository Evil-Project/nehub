CREATE TABLE IF NOT EXISTS artwork_views (
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  viewer_hash TEXT NOT NULL,
  viewed_on TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (artwork_id, viewer_hash, viewed_on)
);

CREATE INDEX IF NOT EXISTS idx_artwork_views_artwork_date
  ON artwork_views(artwork_id, viewed_on DESC);

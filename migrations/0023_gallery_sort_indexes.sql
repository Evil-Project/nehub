CREATE INDEX IF NOT EXISTS idx_artworks_visible_popular
  ON artworks(hidden_at, like_count DESC, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_artworks_visible_rising
  ON artworks(
    hidden_at,
    ((like_count * 1000000) / CASE WHEN view_count < 1 THEN 1 ELSE view_count END) DESC,
    created_at DESC,
    id DESC
  );

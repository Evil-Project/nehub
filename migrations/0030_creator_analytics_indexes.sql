CREATE INDEX IF NOT EXISTS idx_artwork_views_date_artwork
  ON artwork_views(viewed_on DESC, artwork_id);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_artwork_date
  ON user_bookmarks(artwork_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_artwork_date
  ON comments(artwork_id, created_at DESC);

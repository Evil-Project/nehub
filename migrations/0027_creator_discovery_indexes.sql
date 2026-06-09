CREATE INDEX IF NOT EXISTS idx_creators_follower_created
  ON creators(follower_count DESC, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_creators_created_id
  ON creators(created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_creators_handle_nocase
  ON creators(handle COLLATE NOCASE);

CREATE INDEX IF NOT EXISTS idx_creators_display_name_nocase
  ON creators(display_name COLLATE NOCASE);

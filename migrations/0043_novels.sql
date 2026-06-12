CREATE TABLE IF NOT EXISTS novels (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  cover_color TEXT NOT NULL DEFAULT '#fa9ebc',
  tags_json TEXT NOT NULL DEFAULT '[]',
  word_count INTEGER NOT NULL DEFAULT 0,
  read_minutes INTEGER NOT NULL DEFAULT 1,
  like_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mature INTEGER NOT NULL DEFAULT 0,
  mature_rating TEXT NOT NULL DEFAULT 'general'
    CHECK (mature_rating IN ('general', 'restricted', 'adult')),
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'unlisted', 'private'))
);

CREATE INDEX IF NOT EXISTS idx_novels_visibility_created_at
  ON novels(visibility, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_novels_creator_created_at
  ON novels(creator_id, created_at DESC, id DESC);

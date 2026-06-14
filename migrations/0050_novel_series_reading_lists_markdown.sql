CREATE TABLE IF NOT EXISTS novel_series (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_novel_series_user_created
  ON novel_series(user_id, deleted_at, created_at DESC, id DESC);

ALTER TABLE novels ADD COLUMN series_id TEXT;
ALTER TABLE novels ADD COLUMN chapter_number INTEGER;
ALTER TABLE novels ADD COLUMN content_format TEXT NOT NULL DEFAULT 'markdown'
  CHECK (content_format IN ('plain', 'markdown'));
ALTER TABLE novels ADD COLUMN toc_json TEXT NOT NULL DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_novels_series_chapter
  ON novels(series_id, chapter_number, created_at, id);

CREATE TABLE IF NOT EXISTS reading_lists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'public')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_reading_lists_user_created
  ON reading_lists(user_id, deleted_at, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS reading_list_novels (
  reading_list_id TEXT NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
  novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (reading_list_id, novel_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_list_novels_position
  ON reading_list_novels(reading_list_id, position, novel_id);

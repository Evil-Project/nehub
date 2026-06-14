ALTER TABLE novels ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE novels ADD COLUMN cover_image_url TEXT;
ALTER TABLE novels ADD COLUMN bookmark_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE novels ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE novels ADD COLUMN is_draft INTEGER NOT NULL DEFAULT 0;
ALTER TABLE novels ADD COLUMN deleted_at TEXT;

UPDATE novels
SET description = CASE
    WHEN description = '' THEN COALESCE(excerpt, '')
    ELSE description
  END,
  is_draft = CASE
    WHEN COALESCE(visibility, 'public') = 'private' THEN 1
    ELSE 0
  END;

CREATE INDEX IF NOT EXISTS idx_novels_deleted_draft_created
  ON novels(deleted_at, is_draft, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_novels_creator_deleted_draft_created
  ON novels(creator_id, deleted_at, is_draft, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS novel_tags (
  novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (novel_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_novel_tags_tag
  ON novel_tags(tag, novel_id);

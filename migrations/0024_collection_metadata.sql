ALTER TABLE collections ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE collections ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private';
ALTER TABLE collections ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_collections_creator_visibility
  ON collections(creator_id, visibility, created_at DESC);

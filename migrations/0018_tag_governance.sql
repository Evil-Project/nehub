CREATE TABLE IF NOT EXISTS artwork_tags (
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (artwork_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_artwork_tags_tag
  ON artwork_tags(tag, artwork_id);

INSERT OR IGNORE INTO artwork_tags (artwork_id, tag)
SELECT
  artworks.id,
  lower(trim(json_each.value))
FROM artworks, json_each(CASE WHEN json_valid(artworks.tags_json) THEN artworks.tags_json ELSE '[]' END)
WHERE json_valid(artworks.tags_json)
  AND typeof(json_each.value) = 'text'
  AND length(trim(json_each.value)) BETWEEN 1 AND 64;

CREATE TABLE IF NOT EXISTS tag_aliases (
  source_tag TEXT PRIMARY KEY,
  target_tag TEXT NOT NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (source_tag <> target_tag)
);

CREATE INDEX IF NOT EXISTS idx_tag_aliases_target
  ON tag_aliases(target_tag);

CREATE TABLE IF NOT EXISTS tag_implications (
  source_tag TEXT NOT NULL,
  target_tag TEXT NOT NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (source_tag, target_tag),
  CHECK (source_tag <> target_tag)
);

CREATE INDEX IF NOT EXISTS idx_tag_implications_target
  ON tag_implications(target_tag);

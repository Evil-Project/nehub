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

INSERT OR IGNORE INTO creators (id, handle, display_name, avatar_url, bio)
VALUES (
  'usr_default_admin',
  'admin',
  'NEHub Editorial',
  '',
  'Curated platform writing and release notes.'
);

INSERT OR IGNORE INTO novels (
  id,
  creator_id,
  title,
  excerpt,
  body,
  cover_color,
  tags_json,
  word_count,
  read_minutes,
  like_count,
  view_count,
  created_at,
  mature,
  mature_rating,
  visibility
) VALUES (
  'nov_neon_platform',
  'usr_default_admin',
  'Neon Platform at 5:17',
  'A night train waits under a sky full of maintenance drones, and Yui is carrying the only ticket that can wake the terminal city.',
  'The platform clock had stopped at 5:17, but every vending machine still hummed like morning was negotiable.

Yui kept the paper ticket folded inside her glove. It was warm despite the cold, inked with a destination that did not exist on any public route map. When the last train rolled in without a driver, the doors opened only wide enough for one person and a spill of blue light.

She looked back once at the sleeping terminal city. Every tower window blinked in sequence, an old signal from an old promise. Then she stepped across the threshold and heard the announcement say her name.',
  '#00dfee',
  '["sci-fi","train","city"]',
  111,
  1,
  420,
  3200,
  '2026-05-18T09:00:00.000Z',
  0,
  'general',
  'public'
);

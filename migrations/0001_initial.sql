CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  handle TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  follower_count INTEGER NOT NULL DEFAULT 0,
  following INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  dominant_color TEXT NOT NULL DEFAULT '#0f766e',
  tags_json TEXT NOT NULL DEFAULT '[]',
  like_count INTEGER NOT NULL DEFAULT 0,
  bookmark_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mature INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS follows (
  follower_creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  followed_creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_creator_id, followed_creator_id)
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_items (
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection_id, artwork_id)
);

CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_like_count ON artworks(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_creator_id ON artworks(creator_id);
CREATE INDEX IF NOT EXISTS idx_comments_artwork_id ON comments(artwork_id);

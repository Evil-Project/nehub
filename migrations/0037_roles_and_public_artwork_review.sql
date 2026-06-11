PRAGMA foreign_keys = OFF;

CREATE TABLE users_rebuild (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  date_of_birth TEXT,
  mature_content_enabled INTEGER NOT NULL DEFAULT 0,
  bookmark_default_visibility TEXT NOT NULL DEFAULT 'public',
  suspended_at TEXT,
  suspended_reason TEXT,
  profile_visibility TEXT NOT NULL DEFAULT 'public'
);

INSERT INTO users_rebuild (
  id,
  email,
  username,
  display_name,
  password_hash,
  email_verified_at,
  created_at,
  updated_at,
  role,
  date_of_birth,
  mature_content_enabled,
  bookmark_default_visibility,
  suspended_at,
  suspended_reason,
  profile_visibility
)
SELECT
  id,
  email,
  username,
  display_name,
  password_hash,
  email_verified_at,
  created_at,
  updated_at,
  CASE role WHEN 'admin' THEN 'admin' WHEN 'moderator' THEN 'moderator' ELSE 'member' END,
  date_of_birth,
  mature_content_enabled,
  bookmark_default_visibility,
  suspended_at,
  suspended_reason,
  profile_visibility
FROM users;

DROP TABLE users;
ALTER TABLE users_rebuild RENAME TO users;

PRAGMA foreign_keys = ON;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_suspended_at ON users(suspended_at);
CREATE INDEX IF NOT EXISTS idx_users_profile_visibility ON users(profile_visibility);

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO platform_settings (key, value)
VALUES ('public_artwork_review_enabled', 'false');

ALTER TABLE artworks
  ADD COLUMN review_status TEXT NOT NULL DEFAULT 'approved'
  CHECK (review_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE artworks
  ADD COLUMN reviewed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE artworks
  ADD COLUMN reviewed_at TEXT;

CREATE INDEX IF NOT EXISTS idx_artworks_review_status_created_at
  ON artworks(review_status, created_at DESC, id DESC);

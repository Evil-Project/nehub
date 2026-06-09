CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  likes_enabled INTEGER NOT NULL DEFAULT 1 CHECK (likes_enabled IN (0, 1)),
  comments_enabled INTEGER NOT NULL DEFAULT 1 CHECK (comments_enabled IN (0, 1)),
  follows_enabled INTEGER NOT NULL DEFAULT 1 CHECK (follows_enabled IN (0, 1)),
  moderation_enabled INTEGER NOT NULL DEFAULT 1 CHECK (moderation_enabled IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

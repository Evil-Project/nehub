ALTER TABLE users ADD COLUMN date_of_birth TEXT;
ALTER TABLE users ADD COLUMN mature_content_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN bookmark_default_visibility TEXT NOT NULL DEFAULT 'public';

ALTER TABLE user_bookmarks ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public';

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_visibility ON user_bookmarks(visibility);

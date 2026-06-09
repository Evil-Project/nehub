ALTER TABLE users ADD COLUMN profile_visibility TEXT NOT NULL DEFAULT 'public';

CREATE INDEX IF NOT EXISTS idx_users_profile_visibility
  ON users(profile_visibility);

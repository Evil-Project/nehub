ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin'));

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

INSERT OR IGNORE INTO users (
  id,
  email,
  username,
  display_name,
  password_hash,
  email_verified_at,
  created_at,
  updated_at,
  role
) VALUES (
  'usr_default_admin',
  'admin@nehub.local',
  'admin',
  'Administrator',
  'bootstrap-env',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'admin'
);

UPDATE users
SET role = 'admin',
    email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP),
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'usr_default_admin'
   OR email = 'admin@nehub.local';

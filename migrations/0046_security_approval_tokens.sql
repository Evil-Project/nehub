CREATE TABLE IF NOT EXISTS security_approval_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (
    action IN (
      'discord_link',
      'totp_start',
      'totp_disable',
      'email_mfa_enable',
      'email_mfa_disable',
      'passkey_add',
      'passkey_delete'
    )
  ),
  payload_json TEXT NOT NULL DEFAULT '{}',
  return_to TEXT NOT NULL DEFAULT '/settings/privacy-security',
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_security_approval_tokens_hash
  ON security_approval_tokens(token_hash);

CREATE INDEX IF NOT EXISTS idx_security_approval_tokens_user_id
  ON security_approval_tokens(user_id);

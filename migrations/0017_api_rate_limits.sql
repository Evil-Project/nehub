CREATE TABLE IF NOT EXISTS api_rate_limits (
  identifier_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (identifier_hash, action)
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_updated
  ON api_rate_limits(updated_at);

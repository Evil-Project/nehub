CREATE TABLE IF NOT EXISTS moderation_reports (
  id TEXT PRIMARY KEY,
  reporter_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  resolved_by TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_moderation_reports_status
  ON moderation_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_target
  ON moderation_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_reporter
  ON moderation_reports(reporter_user_id);

ALTER TABLE notifications ADD COLUMN novel_id TEXT REFERENCES novels(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_novel
  ON notifications(novel_id);

ALTER TABLE activity_events ADD COLUMN novel_id TEXT REFERENCES novels(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_activity_events_novel
  ON activity_events(novel_id);

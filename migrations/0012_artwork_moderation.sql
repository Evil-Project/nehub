ALTER TABLE artworks ADD COLUMN hidden_at TEXT;

CREATE INDEX IF NOT EXISTS idx_artworks_hidden_at ON artworks(hidden_at);

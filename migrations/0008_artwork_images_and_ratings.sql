ALTER TABLE artworks ADD COLUMN mature_rating TEXT NOT NULL DEFAULT 'general';

UPDATE artworks
SET mature_rating = CASE WHEN mature = 1 THEN 'restricted' ELSE 'general' END
WHERE mature_rating = 'general';

CREATE TABLE IF NOT EXISTS artwork_images (
  id TEXT PRIMARY KEY,
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  dominant_color TEXT NOT NULL DEFAULT '#0f766e',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO artwork_images (
  id,
  artwork_id,
  image_url,
  thumbnail_url,
  width,
  height,
  dominant_color,
  position,
  created_at
)
SELECT
  'img_' || substr(id, 5) || '_0',
  id,
  image_url,
  thumbnail_url,
  width,
  height,
  dominant_color,
  0,
  created_at
FROM artworks;

CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork_position
  ON artwork_images(artwork_id, position);
CREATE INDEX IF NOT EXISTS idx_artworks_mature_rating ON artworks(mature_rating);

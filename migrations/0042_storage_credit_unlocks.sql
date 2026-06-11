ALTER TABLE users
  ADD COLUMN storage_credit_unlocked_slots INTEGER NOT NULL DEFAULT 0;

UPDATE users
SET storage_bonus_credits = MAX(
  COALESCE(storage_bonus_credits, 0),
  (
    SELECT CASE
      WHEN COUNT(artwork_images.id) > 10 THEN COUNT(artwork_images.id) - 10
      ELSE 0
    END
    FROM artworks
    JOIN artwork_images ON artwork_images.artwork_id = artworks.id
    WHERE artworks.creator_id = users.id
  )
);

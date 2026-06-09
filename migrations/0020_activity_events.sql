CREATE TABLE IF NOT EXISTS activity_events (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('publish', 'like', 'comment', 'follow')),
  artwork_id TEXT REFERENCES artworks(id) ON DELETE CASCADE,
  comment_id TEXT REFERENCES comments(id) ON DELETE SET NULL,
  target_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_events_created
  ON activity_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_events_actor_created
  ON activity_events(actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_events_artwork
  ON activity_events(artwork_id);

CREATE INDEX IF NOT EXISTS idx_activity_events_target_user
  ON activity_events(target_user_id, created_at DESC);

INSERT OR IGNORE INTO activity_events (
  id,
  actor_user_id,
  type,
  artwork_id,
  message,
  created_at
)
SELECT
  'act_backfill_' || artworks.id,
  artworks.creator_id,
  'publish',
  artworks.id,
  creators.display_name || ' published "' || artworks.title || '".',
  artworks.created_at
FROM artworks
JOIN creators ON creators.id = artworks.creator_id;

INSERT OR IGNORE INTO activity_events (
  id,
  actor_user_id,
  type,
  artwork_id,
  message,
  created_at
)
SELECT
  'act_backfill_like_' || artwork_likes.user_id || '_' || artwork_likes.artwork_id,
  artwork_likes.user_id,
  'like',
  artwork_likes.artwork_id,
  users.display_name || ' liked "' || artworks.title || '".',
  artwork_likes.created_at
FROM artwork_likes
JOIN users ON users.id = artwork_likes.user_id
JOIN artworks ON artworks.id = artwork_likes.artwork_id;

INSERT OR IGNORE INTO activity_events (
  id,
  actor_user_id,
  type,
  artwork_id,
  comment_id,
  message,
  created_at
)
SELECT
  'act_backfill_comment_' || comments.id,
  comments.user_id,
  'comment',
  comments.artwork_id,
  comments.id,
  comments.author || ' commented on "' || artworks.title || '".',
  comments.created_at
FROM comments
JOIN artworks ON artworks.id = comments.artwork_id
WHERE comments.user_id IS NOT NULL
  AND comments.deleted_at IS NULL;

INSERT OR IGNORE INTO activity_events (
  id,
  actor_user_id,
  type,
  target_user_id,
  message,
  created_at
)
SELECT
  'act_backfill_follow_' || follows.follower_creator_id || '_' || follows.followed_creator_id,
  follows.follower_creator_id,
  'follow',
  follows.followed_creator_id,
  follower.display_name || ' followed ' || followed.display_name || '.',
  follows.created_at
FROM follows
JOIN users AS follower ON follower.id = follows.follower_creator_id
JOIN users AS followed ON followed.id = follows.followed_creator_id;

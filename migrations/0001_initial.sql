CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  handle TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  follower_count INTEGER NOT NULL DEFAULT 0,
  following INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  dominant_color TEXT NOT NULL DEFAULT '#0f766e',
  tags_json TEXT NOT NULL DEFAULT '[]',
  like_count INTEGER NOT NULL DEFAULT 0,
  bookmark_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mature INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS follows (
  follower_creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  followed_creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_creator_id, followed_creator_id)
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_items (
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection_id, artwork_id)
);

CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_like_count ON artworks(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_creator_id ON artworks(creator_id);
CREATE INDEX IF NOT EXISTS idx_comments_artwork_id ON comments(artwork_id);

INSERT OR IGNORE INTO creators
  (id, handle, display_name, avatar_url, bio, follower_count, following)
VALUES
  (
    'usr_mika',
    'mika-lumen',
    'Mika Lumen',
    '/artworks/avatar-mika.png',
    'Editorial color scripts, quiet characters, neon storefronts.',
    24810,
    1
  ),
  (
    'usr_sora',
    'sora-grid',
    'Sora Grid',
    '/artworks/avatar-sora.png',
    'Poster studies and hard-edged city fragments.',
    17640,
    0
  ),
  (
    'usr_ren',
    'ren-ink',
    'Ren Ink',
    '/artworks/avatar-ren.png',
    'Ink texture, screen tone, compressed drama.',
    32190,
    1
  ),
  (
    'usr_noa',
    'noa-signal',
    'Noa Signal',
    '/artworks/avatar-noa.png',
    'Characters, gadgets, and night trains.',
    12930,
    0
  );

INSERT OR IGNORE INTO artworks
  (
    id,
    creator_id,
    title,
    caption,
    image_url,
    thumbnail_url,
    width,
    height,
    dominant_color,
    tags_json,
    like_count,
    bookmark_count,
    view_count,
    comment_count,
    created_at,
    mature
  )
VALUES
  (
    'art_aurora_market',
    'usr_mika',
    'Aurora Market',
    'A late market lane after rain, blocked in like a color script.',
    '/artworks/aurora-market.png',
    '/artworks/aurora-market.png',
    1400,
    1900,
    '#0f766e',
    '["city pop","night","original","background"]',
    12420,
    3810,
    92400,
    82,
    '2026-06-04T11:10:00.000Z',
    0
  ),
  (
    'art_blue_hour_train',
    'usr_noa',
    'Blue Hour Train',
    'Character sketch for a commuter who keeps missing the last stop.',
    '/artworks/blue-hour-train.png',
    '/artworks/blue-hour-train.png',
    1400,
    1600,
    '#2563eb',
    '["character","train","blue hour","original"]',
    8980,
    2410,
    66400,
    44,
    '2026-06-06T09:26:00.000Z',
    0
  ),
  (
    'art_crimson_rooftop',
    'usr_ren',
    'Crimson Rooftop',
    'A rooftop composition study with a hard red key light.',
    '/artworks/crimson-rooftop.png',
    '/artworks/crimson-rooftop.png',
    1400,
    1750,
    '#b91c1c',
    '["action","rooftop","ink","red"]',
    15110,
    4950,
    110300,
    117,
    '2026-06-05T15:48:00.000Z',
    0
  ),
  (
    'art_glass_courtyard',
    'usr_mika',
    'Glass Courtyard',
    'Interior concept with a soft winter palette and deep reflections.',
    '/artworks/glass-courtyard.png',
    '/artworks/glass-courtyard.png',
    1400,
    2050,
    '#14b8a6',
    '["architecture","interior","winter","concept"]',
    7060,
    2084,
    50130,
    31,
    '2026-06-02T03:14:00.000Z',
    0
  ),
  (
    'art_signal_garden',
    'usr_sora',
    'Signal Garden',
    'A synthetic garden where every flower has a notification state.',
    '/artworks/signal-garden.png',
    '/artworks/signal-garden.png',
    1400,
    1500,
    '#16a34a',
    '["graphic","plants","poster","green"]',
    10410,
    3144,
    74300,
    55,
    '2026-06-03T18:09:00.000Z',
    0
  ),
  (
    'art_static_halo',
    'usr_ren',
    'Static Halo',
    'Icon-heavy portrait pass with print texture and clipped shadows.',
    '/artworks/static-halo.png',
    '/artworks/static-halo.png',
    1400,
    1820,
    '#f97316',
    '["portrait","poster","orange","halftone"]',
    18640,
    6211,
    132500,
    151,
    '2026-06-06T01:38:00.000Z',
    0
  ),
  (
    'art_lantern_cache',
    'usr_noa',
    'Lantern Cache',
    'Tiny corner shop for recovered memories and warm batteries.',
    '/artworks/lantern-cache.png',
    '/artworks/lantern-cache.png',
    1400,
    1960,
    '#eab308',
    '["shop","warm light","story","background"]',
    9320,
    2760,
    68820,
    49,
    '2026-06-01T22:04:00.000Z',
    0
  ),
  (
    'art_cutpaper_moon',
    'usr_sora',
    'Cutpaper Moon',
    'Layered moonlit landscape made from torn paper silhouettes.',
    '/artworks/cutpaper-moon.png',
    '/artworks/cutpaper-moon.png',
    1400,
    1700,
    '#475569',
    '["landscape","moon","paper","quiet"]',
    6840,
    1910,
    42220,
    27,
    '2026-05-31T08:45:00.000Z',
    0
  );

INSERT OR IGNORE INTO comments
  (id, artwork_id, author, body, created_at)
VALUES
  (
    'cmt_1',
    'art_static_halo',
    'kiri-note',
    'The cropped shadow under the jaw is doing a lot of work.',
    '2026-06-06T03:15:00.000Z'
  ),
  (
    'cmt_2',
    'art_static_halo',
    'lineweight',
    'Print texture is controlled, especially in the orange field.',
    '2026-06-06T05:20:00.000Z'
  ),
  (
    'cmt_3',
    'art_aurora_market',
    'moss-pixel',
    'That wet pavement palette feels excellent.',
    '2026-06-04T13:33:00.000Z'
  );

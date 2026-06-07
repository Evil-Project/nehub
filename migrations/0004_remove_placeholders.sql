-- Remove placeholder creators, artworks, and comments that were seeded
-- by the original 0001_initial.sql migration. Safe to run on databases
-- that no longer contain these rows.

DELETE FROM comments WHERE id IN ('cmt_1', 'cmt_2', 'cmt_3');

DELETE FROM artworks WHERE id IN (
  'art_aurora_market',
  'art_blue_hour_train',
  'art_crimson_rooftop',
  'art_glass_courtyard',
  'art_signal_garden',
  'art_static_halo',
  'art_lantern_cache',
  'art_cutpaper_moon'
);

DELETE FROM creators WHERE id IN (
  'usr_mika',
  'usr_sora',
  'usr_ren',
  'usr_noa'
);

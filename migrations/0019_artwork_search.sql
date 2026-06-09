CREATE VIRTUAL TABLE IF NOT EXISTS artwork_search USING fts5(
  artwork_id UNINDEXED,
  title,
  caption,
  tags,
  creator
);

INSERT INTO artwork_search (artwork_id, title, caption, tags, creator)
SELECT
  artworks.id,
  artworks.title,
  artworks.caption,
  (
    SELECT COALESCE(group_concat(artwork_tags.tag, ' '), '')
    FROM artwork_tags
    WHERE artwork_tags.artwork_id = artworks.id
  ),
  creators.display_name || ' ' || creators.handle
FROM artworks
JOIN creators ON creators.id = artworks.creator_id;

CREATE INDEX IF NOT EXISTS idx_collections_public_updated
  ON collections(visibility, updated_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_collection_items_collection_created
  ON collection_items(collection_id, created_at DESC, artwork_id);

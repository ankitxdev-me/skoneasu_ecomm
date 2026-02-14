-- Create a function for full-text search with ranking
CREATE OR REPLACE FUNCTION search_products(keyword text)
RETURNS SETOF products AS $$
  SELECT *
  FROM products
  WHERE to_tsvector('english', name || ' ' || coalesce(description, '')) @@ plainto_tsquery('english', keyword)
  ORDER BY ts_rank(to_tsvector('english', name || ' ' || coalesce(description, '')), plainto_tsquery('english', keyword)) DESC;
$$ LANGUAGE sql STABLE;

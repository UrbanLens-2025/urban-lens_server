-- Initialize location_analytics for all locations that don't have one yet
-- This ensures all locations have analytics records with default values

\c urban_lens_dev

-- Insert analytics for locations without them
INSERT INTO development.location_analytics (
  location_id,
  total_reviews,
  average_rating,
  total_posts,
  total_check_ins,
  created_at,
  updated_at
)
SELECT 
  l.id,
  0, -- total_reviews
  0, -- average_rating
  0, -- total_posts
  0, -- total_check_ins
  NOW(),
  NOW()
FROM development.locations l
LEFT JOIN development.location_analytics la ON l.id = la.location_id
WHERE la.id IS NULL
ON CONFLICT (location_id) DO NOTHING;

-- Show results
SELECT 
  COUNT(*) as total_locations,
  COUNT(la.id) as locations_with_analytics,
  COUNT(*) - COUNT(la.id) as locations_without_analytics
FROM development.locations l
LEFT JOIN development.location_analytics la ON l.id = la.location_id
WHERE l.is_visible_on_map = true;

-- Show sample locations with data
SELECT 
  l.name,
  la.total_check_ins,
  la.average_rating,
  la.total_reviews
FROM development.locations l
INNER JOIN development.location_analytics la ON l.id = la.location_id
WHERE l.is_visible_on_map = true
  AND (la.total_check_ins > 0 OR la.total_reviews > 0)
ORDER BY la.total_check_ins DESC, la.average_rating DESC
LIMIT 10;


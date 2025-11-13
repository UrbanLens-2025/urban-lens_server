-- Add unique constraint to location_analytics.location_id
-- This is required for ON CONFLICT (location_id) to work in upsert queries

-- First, check if there are any duplicate location_id entries
SELECT location_id, COUNT(*) 
FROM development.location_analytics 
GROUP BY location_id 
HAVING COUNT(*) > 1;

-- If there are duplicates, we need to clean them up first
-- Keep the most recent record for each location_id
DELETE FROM development.location_analytics
WHERE id NOT IN (
  SELECT DISTINCT ON (location_id) id
  FROM development.location_analytics
  ORDER BY location_id, updated_at DESC NULLS LAST, created_at DESC
);

-- Now add the unique constraint
ALTER TABLE development.location_analytics 
ADD CONSTRAINT location_analytics_location_id_unique 
UNIQUE (location_id);

-- Verify the constraint was created
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'development.location_analytics'::regclass 
  AND contype = 'u';


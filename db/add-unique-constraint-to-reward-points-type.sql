-- Add unique constraint to reward_points.type column
-- This ensures each reward point type can only exist once in the database

-- First, check if there are any duplicate type entries
SELECT type, COUNT(*) 
FROM development.reward_points 
GROUP BY type 
HAVING COUNT(*) > 1;

-- If there are duplicates, remove them (keep the first one based on id)
-- Use a subquery to identify which records to keep
DELETE FROM development.reward_points
WHERE id NOT IN (
  SELECT DISTINCT ON (type) id
  FROM development.reward_points
  ORDER BY type, id
);

-- Drop the constraint if it already exists (in case of retry)
ALTER TABLE development.reward_points
DROP CONSTRAINT IF EXISTS reward_points_type_unique;

-- Now add the unique constraint
ALTER TABLE development.reward_points
ADD CONSTRAINT reward_points_type_unique UNIQUE (type);

-- Verify the constraint was created
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'development.reward_points'::regclass 
  AND contype = 'u';


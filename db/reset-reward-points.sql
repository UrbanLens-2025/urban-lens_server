-- Reset reward_points table: delete all and let seeder recreate
-- This fixes the duplicate issue before adding unique constraint

-- Delete all reward points
DELETE FROM development.reward_points;

-- Drop the constraint if it exists (in case of retry)
ALTER TABLE development.reward_points
DROP CONSTRAINT IF EXISTS reward_points_type_unique;

-- The seeder will automatically recreate all reward points on app startup


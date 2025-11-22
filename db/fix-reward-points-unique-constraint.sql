-- Complete fix for reward_points unique constraint issue
-- This script: 1) deletes all reward points, 2) adds unique constraint
-- The seeder will automatically recreate reward points on app startup

-- Step 1: Delete all reward points to remove duplicates
DELETE FROM development.reward_points;

-- Step 2: Drop the constraint if it exists (in case of retry)
ALTER TABLE development.reward_points
DROP CONSTRAINT IF EXISTS reward_points_type_unique;

-- Step 3: Add unique constraint
ALTER TABLE development.reward_points
ADD CONSTRAINT reward_points_type_unique UNIQUE (type);

-- Verify the constraint was created
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'development.reward_points'::regclass 
  AND contype = 'u';

-- Note: After running this script, restart the app and the RewardPointSeederHelper
-- will automatically recreate all reward points with the correct values.


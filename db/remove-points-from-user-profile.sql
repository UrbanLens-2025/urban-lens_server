-- Remove points column from user_profiles table
-- Only ranking_point will be used going forward

ALTER TABLE user_profiles
DROP COLUMN IF EXISTS points;


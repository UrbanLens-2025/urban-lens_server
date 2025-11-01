-- Add tag_scores column to user_profiles table
-- This stores user preferences/interests as tag scores

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS tag_scores JSONB DEFAULT '{}'::JSONB;

-- Create GIN index for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_tag_scores 
ON user_profiles USING GIN (tag_scores);

-- Example tag_scores structure:
-- {
--   "food": 85,
--   "coffee": 92,
--   "nature": 65,
--   "art": 78,
--   "nightlife": 45
-- }
--
-- Higher score = stronger preference
-- Scores typically range from 0-100


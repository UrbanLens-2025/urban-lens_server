-- Migrate existing user_tags to user_profiles.tagScores
-- This script initializes tagScores for users who onboarded but don't have tagScores yet

\c urban_lens_dev

-- Update user_profiles with tagScores from user_tags
UPDATE development.user_profiles up
SET tag_scores = (
  SELECT jsonb_object_agg(
    'tag_' || ut.tag_id::text,
    10  -- Initial score for onboarding tags
  )
  FROM development.user_tags ut
  WHERE ut.account_id = up.account_id
)
WHERE up.tag_scores IS NULL OR up.tag_scores = '{}'::jsonb;

-- Verify the migration
SELECT 
  account_id,
  tag_scores,
  (SELECT COUNT(*) FROM development.user_tags WHERE account_id = up.account_id) as user_tags_count
FROM development.user_profiles up
WHERE tag_scores IS NOT NULL AND tag_scores != '{}'::jsonb
LIMIT 10;

-- Summary
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN tag_scores IS NOT NULL AND tag_scores != '{}'::jsonb THEN 1 END) as profiles_with_scores,
  COUNT(CASE WHEN tag_scores IS NULL OR tag_scores = '{}'::jsonb THEN 1 END) as profiles_without_scores
FROM development.user_profiles;



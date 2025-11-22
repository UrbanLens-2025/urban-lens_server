-- Delete all reward points from the database
DELETE FROM development.reward_points;

-- Verify deletion
SELECT COUNT(*) as remaining_reward_points FROM development.reward_points;


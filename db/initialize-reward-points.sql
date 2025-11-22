-- Initialize reward points for gamification system
-- This script creates default reward points if they don't exist

-- Insert check_in reward point
INSERT INTO reward_points (type, points)
SELECT 'check_in', 10
WHERE NOT EXISTS (SELECT 1 FROM reward_points WHERE type = 'check_in');

-- Insert create_blog reward point
INSERT INTO reward_points (type, points)
SELECT 'create_blog', 20
WHERE NOT EXISTS (SELECT 1 FROM reward_points WHERE type = 'create_blog');

-- Insert create_review reward point
INSERT INTO reward_points (type, points)
SELECT 'create_review', 15
WHERE NOT EXISTS (SELECT 1 FROM reward_points WHERE type = 'create_review');

-- Insert create_comment reward point
INSERT INTO reward_points (type, points)
SELECT 'create_comment', 5
WHERE NOT EXISTS (SELECT 1 FROM reward_points WHERE type = 'create_comment');

-- Insert share_blog reward point
INSERT INTO reward_points (type, points)
SELECT 'share_blog', 5
WHERE NOT EXISTS (SELECT 1 FROM reward_points WHERE type = 'share_blog');

-- Insert share_itinerary reward point
INSERT INTO reward_points (type, points)
SELECT 'share_itinerary', 10
WHERE NOT EXISTS (SELECT 1 FROM reward_points WHERE type = 'share_itinerary');

-- Note: If you need to update existing reward points, use:
-- UPDATE reward_points SET points = 10 WHERE type = 'check_in';


-- Insert default reward points
-- This matches the values in RewardPointSeeder.helper.ts

INSERT INTO development.reward_points (type, points) VALUES
  ('check_in', 10),
  ('create_blog', 20),
  ('create_review', 15),
  ('create_comment', 5),
  ('share_blog', 5),
  ('share_itinerary', 10)
ON CONFLICT (type) DO UPDATE SET points = EXCLUDED.points;

-- Verify insertion
SELECT type, points FROM development.reward_points ORDER BY type;


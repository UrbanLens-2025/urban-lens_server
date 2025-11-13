-- Remove metric column from location_missions table
-- Missions now only track check-ins

-- Drop the metric column
ALTER TABLE development.location_missions 
DROP COLUMN IF EXISTS metric;

-- Verification query
-- SELECT id, title, target, reward FROM development.location_missions LIMIT 10;


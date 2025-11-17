-- Add total distance and travel time to itineraries
ALTER TABLE IF EXISTS development.itinerary
  ADD COLUMN IF NOT EXISTS total_distance_km double precision DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_travel_minutes integer DEFAULT 0;

-- Add per-segment travel metrics to itinerary locations
ALTER TABLE IF EXISTS development.itinerary_location
  ADD COLUMN IF NOT EXISTS travel_distance_km double precision,
  ADD COLUMN IF NOT EXISTS travel_duration_minutes integer;



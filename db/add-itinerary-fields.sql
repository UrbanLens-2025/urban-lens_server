-- Add album, thumbnail_url, and location_wishlist fields to itinerary table

-- Add album column (array of image URLs)
ALTER TABLE development.itinerary
ADD COLUMN IF NOT EXISTS album TEXT[] DEFAULT '{}';

-- Add thumbnail_url column
ALTER TABLE development.itinerary
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add location_wishlist column (array of location IDs, no foreign key constraint)
ALTER TABLE development.itinerary
ADD COLUMN IF NOT EXISTS location_wishlist UUID[] DEFAULT '{}';

-- Add comments
COMMENT ON COLUMN development.itinerary.album IS 'Array of image URLs for the itinerary album';
COMMENT ON COLUMN development.itinerary.thumbnail_url IS 'Thumbnail image URL for the itinerary';
COMMENT ON COLUMN development.itinerary.location_wishlist IS 'Array of location IDs in wishlist (no foreign key constraint)';


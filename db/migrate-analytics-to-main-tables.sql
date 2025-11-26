-- Migration: Move analytics from analytic and location_analytics tables to main tables
-- This script migrates analytics data and then drops the analytic tables

BEGIN;

-- Step 1: Add analytics columns to posts table (if not exists)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS total_upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_downvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comments INTEGER DEFAULT 0;

-- Step 2: Add analytics columns to comments table (if not exists)
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS total_upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_downvotes INTEGER DEFAULT 0;

-- Step 3: Add analytics columns to events table (if not exists)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0;

-- Step 4: Add analytics columns to locations table (if not exists)
ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS total_posts BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_check_ins BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;

-- Step 5: Migrate data from analytic table to posts table
UPDATE posts p
SET 
  total_upvotes = COALESCE(a.total_upvotes, 0),
  total_downvotes = COALESCE(a.total_downvotes, 0),
  total_comments = COALESCE(a.total_comments, 0)
FROM analytic a
WHERE a.entity_id::uuid = p.post_id 
  AND a.entity_type = 'post';

-- Step 6: Migrate data from analytic table to comments table
UPDATE comments c
SET 
  total_upvotes = COALESCE(a.total_upvotes, 0),
  total_downvotes = COALESCE(a.total_downvotes, 0)
FROM analytic a
WHERE a.entity_id::uuid = c.comment_id 
  AND a.entity_type = 'comment';

-- Step 7: Migrate data from analytic table to events table
UPDATE events e
SET 
  total_reviews = COALESCE(a.total_reviews, 0),
  avg_rating = COALESCE(a.avg_rating, 0)
FROM analytic a
WHERE a.entity_id::uuid = e.id 
  AND a.entity_type = 'event';

-- Step 8: Migrate data from location_analytics table to locations table
UPDATE locations l
SET 
  total_posts = COALESCE(la.total_posts, 0),
  total_check_ins = COALESCE(la.total_check_ins, 0),
  total_reviews = COALESCE(la.total_reviews, 0),
  average_rating = COALESCE(la.average_rating, 0)
FROM location_analytics la
WHERE la.location_id = l.id;

-- Step 9: Drop the analytic table
DROP TABLE IF EXISTS analytic CASCADE;

-- Step 10: Drop the location_analytics table
DROP TABLE IF EXISTS location_analytics CASCADE;

COMMIT;


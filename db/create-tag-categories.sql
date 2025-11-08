-- Create tag_category table
-- This table stores predefined preference profiles for users

\c ubl_db

CREATE TABLE IF NOT EXISTS development.tag_category (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  tag_score_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_tag_category_weights 
ON development.tag_category USING gin(tag_score_weights);

-- Insert sample categories
-- Note: Adjust tag IDs based on your actual tags in the system

-- Category 1: Thích yên tĩnh (Prefer quiet places)
INSERT INTO development.tag_category (name, description, tag_score_weights)
VALUES (
  'Thích yên tĩnh',
  'Ưa thích những địa điểm yên tĩnh, thư giãn, gần thiên nhiên',
  jsonb_build_object(
    'tag_2', 10,   -- Thiên nhiên
    'tag_3', 8,    -- Yên tĩnh
    'tag_5', 7,    -- Thư giãn
    'tag_7', -8,   -- Sôi động (negative)
    'tag_9', -5,   -- Đông người (negative)
    'tag_10', -6   -- Ồn ào (negative)
  )
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  tag_score_weights = EXCLUDED.tag_score_weights,
  updated_at = CURRENT_TIMESTAMP;

-- Category 2: Thích sôi động (Prefer lively places)
INSERT INTO development.tag_category (name, description, tag_score_weights)
VALUES (
  'Thích sôi động',
  'Ưa thích những địa điểm sôi động, vui vẻ, đông người',
  jsonb_build_object(
    'tag_7', 10,   -- Sôi động
    'tag_9', 8,    -- Đông người
    'tag_11', 7,   -- Giải trí
    'tag_2', -6,   -- Thiên nhiên (negative)
    'tag_3', -8,   -- Yên tĩnh (negative)
    'tag_5', -5    -- Thư giãn (negative)
  )
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  tag_score_weights = EXCLUDED.tag_score_weights,
  updated_at = CURRENT_TIMESTAMP;

-- Category 3: Ưa thiên nhiên (Nature lover)
INSERT INTO development.tag_category (name, description, tag_score_weights)
VALUES (
  'Ưa thiên nhiên',
  'Yêu thích cảnh quan thiên nhiên, không gian xanh, hoạt động ngoài trời',
  jsonb_build_object(
    'tag_2', 10,   -- Thiên nhiên
    'tag_4', 9,    -- Cảnh đẹp
    'tag_6', 8,    -- Ngoài trời
    'tag_8', 7,    -- Hoạt động thể thao
    'tag_12', -7   -- Trong nhà (negative)
  )
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  tag_score_weights = EXCLUDED.tag_score_weights,
  updated_at = CURRENT_TIMESTAMP;

-- Category 4: Thích văn hóa - lịch sử (Culture & History)
INSERT INTO development.tag_category (name, description, tag_score_weights)
VALUES (
  'Thích văn hóa - lịch sử',
  'Quan tâm đến văn hóa, lịch sử, di tích, bảo tàng',
  jsonb_build_object(
    'tag_1', 10,   -- Văn hóa
    'tag_13', 9,   -- Lịch sử
    'tag_14', 8,   -- Bảo tàng
    'tag_15', 7,   -- Kiến trúc
    'tag_7', -5    -- Sôi động (negative)
  )
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  tag_score_weights = EXCLUDED.tag_score_weights,
  updated_at = CURRENT_TIMESTAMP;

-- Category 5: Thích ẩm thực (Foodie)
INSERT INTO development.tag_category (name, description, tag_score_weights)
VALUES (
  'Thích ẩm thực',
  'Đam mê khám phá ẩm thực, quán ăn, cafe',
  jsonb_build_object(
    'tag_16', 10,  -- Ẩm thực
    'tag_17', 9,   -- Cafe
    'tag_18', 8,   -- Quán ăn
    'tag_19', 7,   -- Đặc sản địa phương
    'tag_8', -4    -- Hoạt động thể thao (negative)
  )
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  tag_score_weights = EXCLUDED.tag_score_weights,
  updated_at = CURRENT_TIMESTAMP;

-- Verify insertion
SELECT 
  id,
  name,
  description,
  jsonb_pretty(tag_score_weights) as weights
FROM development.tag_category
ORDER BY id;

-- Show summary
SELECT 
  COUNT(*) as total_categories,
  AVG(jsonb_object_keys(tag_score_weights)::int) as avg_tags_per_category
FROM development.tag_category;


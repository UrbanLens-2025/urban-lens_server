-- Update TagCategory to support multiple applicable types
-- Add applicable_types as array to support multi-purpose categories

-- Step 1: Add new column
ALTER TABLE development.tag_category 
ADD COLUMN IF NOT EXISTS applicable_types JSONB DEFAULT '["USER"]'::jsonb;

-- Step 2: If category_type column exists, migrate data from it
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'development' 
    AND table_name = 'tag_category' 
    AND column_name = 'category_type'
  ) THEN
    UPDATE development.tag_category
    SET applicable_types = jsonb_build_array(category_type)
    WHERE category_type IS NOT NULL;
    
    RAISE NOTICE 'Migrated data from category_type to applicable_types';
  ELSE
    RAISE NOTICE 'No category_type column found, skipping migration';
  END IF;
END $$;

-- Step 4: Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_tag_category_applicable_types 
ON development.tag_category USING gin(applicable_types);

-- Add comment
COMMENT ON COLUMN development.tag_category.applicable_types IS 
'Array of entity types this category applies to: USER (user onboarding), LOCATION (location creation), EVENT (event creation). A category can apply to multiple types.';

-- Show current distribution
SELECT 
  applicable_types,
  COUNT(*) as count,
  array_agg(name ORDER BY name) as category_names
FROM development.tag_category
GROUP BY applicable_types
ORDER BY applicable_types::text;


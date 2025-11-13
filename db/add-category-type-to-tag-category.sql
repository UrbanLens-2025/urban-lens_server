-- Add category_type column to tag_category table
-- This field distinguishes whether the category applies to USER, LOCATION, EVENT, or ALL

DO $$ 
BEGIN
  -- Add category_type column if not exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'development' 
    AND table_name = 'tag_category' 
    AND column_name = 'category_type'
  ) THEN
    ALTER TABLE development.tag_category 
    ADD COLUMN category_type VARCHAR(20) DEFAULT 'USER';
    
    RAISE NOTICE '✅ Added category_type column to tag_category table';
  ELSE
    RAISE NOTICE '⚠️  category_type column already exists';
  END IF;
  
  -- Add check constraint for category_type values
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.constraint_column_usage 
    WHERE table_schema = 'development' 
    AND table_name = 'tag_category' 
    AND constraint_name = 'tag_category_category_type_check'
  ) THEN
    ALTER TABLE development.tag_category 
    ADD CONSTRAINT tag_category_category_type_check 
    CHECK (category_type IN ('USER', 'LOCATION', 'EVENT', 'ALL'));
    
    RAISE NOTICE '✅ Added check constraint for category_type';
  ELSE
    RAISE NOTICE '⚠️  Check constraint already exists';
  END IF;
  
  -- Create index on category_type for faster filtering
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'development' 
    AND tablename = 'tag_category' 
    AND indexname = 'idx_tag_category_category_type'
  ) THEN
    CREATE INDEX idx_tag_category_category_type 
    ON development.tag_category(category_type);
    
    RAISE NOTICE '✅ Created index on category_type';
  ELSE
    RAISE NOTICE '⚠️  Index on category_type already exists';
  END IF;
  
END $$;

-- Show results
SELECT 
  id, 
  name, 
  category_type,
  color,
  icon
FROM development.tag_category
ORDER BY category_type, id;


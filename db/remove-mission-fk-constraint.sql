-- Remove foreign key constraint for mission_id in one_time_qr_codes table
-- This constraint is causing issues because mission_id can be null for one-time QR codes

-- First, check if the constraint exists and drop it
DO $$ 
BEGIN
    -- Drop the foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'FK_941d436dd6c861ea0ab680b18e3'
        AND table_name = 'one_time_qr_codes'
    ) THEN
        ALTER TABLE one_time_qr_codes 
        DROP CONSTRAINT FK_941d436dd6c861ea0ab680b18e3;
        RAISE NOTICE 'Dropped constraint FK_941d436dd6c861ea0ab680b18e3';
    ELSE
        RAISE NOTICE 'Constraint FK_941d436dd6c861ea0ab680b18e3 does not exist';
    END IF;
END $$;

-- Also try dropping by the generic name pattern
DO $$ 
BEGIN
    -- Drop any foreign key constraint on mission_id
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%mission%'
        AND table_name = 'one_time_qr_codes'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE one_time_qr_codes 
        DROP CONSTRAINT IF EXISTS fk_one_time_qr_mission;
        RAISE NOTICE 'Dropped constraint fk_one_time_qr_mission';
    END IF;
END $$;

-- Make sure mission_id is nullable
ALTER TABLE one_time_qr_codes 
ALTER COLUMN mission_id DROP NOT NULL;

-- Verify the changes
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'one_time_qr_codes' 
AND column_name = 'mission_id';

-- Merge voucher tables: add userVoucherCode and usedAt to exchange histories
-- This allows tracking both exchange and usage in a single table

-- Step 1: Add new columns to user_location_voucher_exchange_histories
ALTER TABLE user_location_voucher_exchange_histories
ADD COLUMN IF NOT EXISTS user_voucher_code VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE NULL;

-- Step 2: Generate unique codes for existing records (if any)
UPDATE user_location_voucher_exchange_histories
SET user_voucher_code = 'VC-' || EXTRACT(EPOCH FROM created_at)::BIGINT || '-' || 
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 6))
WHERE user_voucher_code IS NULL;

-- Step 3: Make user_voucher_code NOT NULL after populating
ALTER TABLE user_location_voucher_exchange_histories
ALTER COLUMN user_voucher_code SET NOT NULL;

-- Step 4: Create index on user_voucher_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_voucher_code 
ON user_location_voucher_exchange_histories(user_voucher_code);

-- Step 5: Create index on usedAt for filtering available/used vouchers
CREATE INDEX IF NOT EXISTS idx_used_at 
ON user_location_voucher_exchange_histories(used_at);

-- Step 6: Drop old tables (only if you're sure migration is complete)
-- DROP TABLE IF EXISTS user_location_voucher_usages;
-- DROP TABLE IF EXISTS user_location_vouchers;

-- Note: Uncomment Step 6 after verifying the migration works correctly


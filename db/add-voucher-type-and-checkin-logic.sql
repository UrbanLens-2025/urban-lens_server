-- Add voucher_type column to location_vouchers table
ALTER TABLE location_vouchers 
ADD COLUMN voucher_type VARCHAR(20) DEFAULT 'public' CHECK (voucher_type IN ('public', 'mission_only'));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_location_vouchers_type ON location_vouchers(voucher_type);

-- Add index for check-in queries
CREATE INDEX IF NOT EXISTS idx_check_ins_user_location ON check_ins(user_profile_id, location_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_created_at ON check_ins(created_at);

-- Update existing vouchers to be public by default
UPDATE location_vouchers SET voucher_type = 'public' WHERE voucher_type IS NULL;

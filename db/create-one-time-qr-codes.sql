-- Create one_time_qr_codes table
CREATE TABLE IF NOT EXISTS one_time_qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_data TEXT NOT NULL,
    qr_code_url TEXT NOT NULL,
    location_id UUID NOT NULL,
    business_owner_id UUID NOT NULL,
    scanned_by UUID NULL,
    scanned_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    reference_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_one_time_qr_scanned_by 
        FOREIGN KEY (scanned_by) 
        REFERENCES user_profiles(account_id) 
        ON DELETE SET NULL,
    
    CONSTRAINT fk_one_time_qr_business_owner 
        FOREIGN KEY (business_owner_id) 
        REFERENCES user_profiles(account_id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_one_time_qr_code_data ON one_time_qr_codes(qr_code_data);
CREATE INDEX IF NOT EXISTS idx_one_time_qr_location_id ON one_time_qr_codes(location_id);
CREATE INDEX IF NOT EXISTS idx_one_time_qr_business_owner ON one_time_qr_codes(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_one_time_qr_expires_at ON one_time_qr_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_one_time_qr_is_used ON one_time_qr_codes(is_used);

-- Create composite index for finding valid QR codes
CREATE INDEX IF NOT EXISTS idx_one_time_qr_valid 
    ON one_time_qr_codes(qr_code_data, is_used) 
    WHERE is_used = FALSE;

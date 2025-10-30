-- Fix one_time_qr_codes table constraints
-- Drop existing foreign key constraint for mission_id
ALTER TABLE one_time_qr_codes 
DROP CONSTRAINT IF EXISTS fk_one_time_qr_mission;

-- Make mission_id nullable
ALTER TABLE one_time_qr_codes 
ALTER COLUMN mission_id DROP NOT NULL;

-- No need to re-add foreign key constraint since missionId can be null
-- for one-time QR codes that work with all ORDER_COUNT missions at a location

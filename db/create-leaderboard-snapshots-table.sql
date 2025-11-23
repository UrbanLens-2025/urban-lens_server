-- Create leaderboard_snapshots table to store historical leaderboard data
-- This table stores leaderboard snapshots for monthly, yearly, and seasonal periods

CREATE TABLE IF NOT EXISTS development.leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('monthly', 'yearly', 'seasonal')),
  period_value VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL,
  ranking_point INTEGER NOT NULL DEFAULT 0,
  rank_position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_leaderboard_snapshots_user_id FOREIGN KEY (user_id) REFERENCES development.accounts(id) ON DELETE CASCADE
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_period_type_value_position 
ON development.leaderboard_snapshots(period_type, period_value, rank_position);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_snapshots_period_type_value_user_id 
ON development.leaderboard_snapshots(period_type, period_value, user_id);

-- Add comment
COMMENT ON TABLE development.leaderboard_snapshots IS 'Stores historical leaderboard snapshots for monthly, yearly, and seasonal periods';
COMMENT ON COLUMN development.leaderboard_snapshots.period_type IS 'Type of period: monthly, yearly, or seasonal';
COMMENT ON COLUMN development.leaderboard_snapshots.period_value IS 'Period identifier: YYYY-MM for monthly, YYYY for yearly, YYYY-season for seasonal (e.g., 2025-spring)';
COMMENT ON COLUMN development.leaderboard_snapshots.rank_position IS 'User position in leaderboard (1-based)';


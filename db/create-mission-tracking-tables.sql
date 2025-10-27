-- Create user_mission_progresses table
CREATE TABLE IF NOT EXISTS user_mission_progresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID NOT NULL,
    mission_id UUID NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_user_mission_progresses_user_profile 
        FOREIGN KEY (user_profile_id) 
        REFERENCES user_profiles(account_id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_user_mission_progresses_mission 
        FOREIGN KEY (mission_id) 
        REFERENCES location_missions(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT uq_user_mission_progress 
        UNIQUE (user_profile_id, mission_id)
);

-- Create location_mission_logs table
CREATE TABLE IF NOT EXISTS location_mission_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_mission_progress_id UUID NOT NULL,
    image_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_location_mission_logs_progress 
        FOREIGN KEY (user_mission_progress_id) 
        REFERENCES user_mission_progresses(id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_mission_progresses_user ON user_mission_progresses(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progresses_mission ON user_mission_progresses(mission_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progresses_completed ON user_mission_progresses(completed);
CREATE INDEX IF NOT EXISTS idx_location_mission_logs_progress ON location_mission_logs(user_mission_progress_id);
CREATE INDEX IF NOT EXISTS idx_location_mission_logs_created ON location_mission_logs(created_at);

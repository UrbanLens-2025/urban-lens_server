## 30. Location Mission Logs Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | text |  | x | PK |  |
| user_mission_progress_id | varchar(255) |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| image_urls | text |  |  |  | default: [] |

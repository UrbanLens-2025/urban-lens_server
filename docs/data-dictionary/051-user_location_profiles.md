## 51. User Location Profiles Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| location_id | varchar(255) |  |  | FK |  |
| user_profile_id | varchar(255) |  |  | FK |  |
| available_points | varchar(255) |  |  |  |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| total_points | varchar(255) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

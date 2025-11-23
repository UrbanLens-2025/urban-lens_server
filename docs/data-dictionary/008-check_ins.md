## 8. Check Ins Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| location_id | varchar(255) |  |  | FK |  |
| user_profile_id | varchar(255) |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| latitude_at_check_in | double precision |  |  |  |  |
| longitude_at_check_in | double precision |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

## 26. Location Availability Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| created_by | uuid |  |  | FK |  |
| location_id | uuid |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| day_of_week | varchar(20) |  |  |  |  |
| end_time | time without time zone |  |  |  |  |
| start_time | time without time zone |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

## 31. Location Missions Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | timestamp with time zone |  | x | PK |  |
| location_id | varchar(255) |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| description | varchar(255) |  |  |  |  |
| end_date | timestamp with time zone |  |  |  |  |
| image_urls | text |  |  |  | default: [] |
| reward | varchar(255) |  |  |  |  |
| start_date | timestamp with time zone |  |  |  |  |
| target | varchar(255) |  |  |  |  |
| title | varchar(255) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

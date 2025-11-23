## 6. Announcements Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| created_by | uuid | x |  | FK |  |
| event_id | uuid | x |  | FK |  |
| location_id | uuid | x |  | FK |  |
| updated_by | uuid | x |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| description | text |  |  |  |  |
| end_date | timestamp with time zone | x |  |  |  |
| image_url | text | x |  |  |  |
| is_hidden | bit |  |  |  | default: false |
| start_date | timestamp with time zone |  |  |  |  |
| title | varchar(255) |  |  |  |  |
| type | varchar(50) |  |  |  | default: AnnouncementType.LOCATION |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

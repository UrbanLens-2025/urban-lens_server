## 5. Announcements Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| created_at | timestamp with time zone |  |  |  |  |
| description | text |  |  |  |  |
| end_date | timestamp with time zone | x |  |  |  |
| image_url | text | x |  |  |  |
| is_hidden | bit |  |  |  | default: false |
| start_date | timestamp with time zone |  |  |  |  |
| title | varchar(255) |  |  |  |  |
| type | varchar(50) |  |  |  | default: LOCATION |
| updated_at | timestamp with time zone |  |  |  |  |

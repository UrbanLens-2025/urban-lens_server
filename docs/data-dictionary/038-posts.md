## 38. Posts Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| content | text |  |  |  |  |
| created_at | timestamp with time zone |  |  |  |  |
| event_id | uuid | x |  |  |  |
| image_urls | text |  |  |  | default: '{}'[] |
| is_hidden | bit |  |  |  | default: false |
| is_verified | bit |  |  |  | default: false |
| location_id | uuid | x |  |  |  |
| rating | int | x |  |  |  |
| type | varchar(50) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  |  |
| visibility | varchar(50) | x |  |  |  |

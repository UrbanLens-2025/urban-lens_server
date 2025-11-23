## 44. Reports Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| attached_image_urls | text |  |  |  | default: '{}'[] |
| created_at | timestamp with time zone |  |  |  |  |
| description | text | x |  |  |  |
| reported_reason | varchar(100) |  |  |  |  |
| status | varchar(50) |  |  |  |  |
| target_id | uuid |  |  |  |  |
| target_type | varchar(50) |  |  |  |  |
| title | varchar(555) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  |  |

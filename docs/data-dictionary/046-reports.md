## 46. Reports Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | varchar(255) |  | x | PK |  |
| created_by | uuid |  |  | FK |  |
| last_updated_by | uuid | x |  | FK |  |
| reported_reason | varchar(100) |  |  | FK |  |
| target_id | uuid |  |  | FK |  |
| attached_image_urls | text |  |  |  | default: [] |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| description | text | x |  |  |  |
| status | varchar(50) |  |  |  |  |
| target_type | varchar(50) |  |  |  |  |
| title | varchar(555) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

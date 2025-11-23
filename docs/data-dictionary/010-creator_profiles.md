## 10. Creator Profiles Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| account_id | varchar(255) |  | x | PK, FK |  |
| avatar_url | varchar(2048) |  |  |  |  |
| cover_url | varchar(2048) |  |  |  |  |
| description | text |  |  |  |  |
| display_name | varchar(555) |  |  |  |  |
| email | varchar(255) |  |  |  |  |
| phone | varchar(255) |  |  |  |  |
| social | jsonb | x |  |  |  |
| type | varchar(100) |  |  |  |  |

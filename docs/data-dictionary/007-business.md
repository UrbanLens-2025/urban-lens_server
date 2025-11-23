## 7. Business Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| account_id | varchar(255) |  | x | PK, FK |  |
| address_level_1 | varchar(255) |  |  |  |  |
| address_level_2 | varchar(255) |  |  |  |  |
| address_line | varchar(255) |  |  |  |  |
| admin_notes | text | x |  |  |  |
| avatar | varchar(255) | x |  |  |  |
| category | varchar(50) |  |  |  | default: BusinessCategory.OTHER |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| description | text |  |  |  |  |
| email | varchar(255) |  |  |  |  |
| is_active | bit |  |  |  | default: true |
| licenses | jsonb | x |  |  |  |
| name | varchar(255) |  |  |  |  |
| phone | varchar(255) |  |  |  |  |
| status | varchar(50) |  |  |  | default: BusinessRequestStatus.PENDING |
| updated_at | timestamp with time zone |  |  |  | auto-generated |
| website | varchar(255) |  |  |  |  |

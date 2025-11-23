## 45. Report Reasons Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| key | varchar(255) |  | x | PK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| description | text |  |  |  |  |
| display_name | varchar(255) |  |  |  |  |
| is_active | bit |  |  |  | default: false |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

## 38. One Time Q R Codes Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | text |  | x | PK |  |
| business_owner_id | uuid |  |  | FK |  |
| location_id | uuid |  |  | FK |  |
| scanned_by | uuid | x |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| expires_at | timestamp with time zone |  |  |  |  |
| is_used | bit |  |  |  | default: false |
| qr_code_data | text |  |  |  |  |
| qr_code_url | text |  |  |  |  |
| reference_id | varchar(255) | x |  |  |  |
| scanned_at | timestamp with time zone | x |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

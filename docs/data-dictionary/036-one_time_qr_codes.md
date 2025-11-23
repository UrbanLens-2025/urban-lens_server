## 36. One Time Qr Codes Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| created_at | timestamp with time zone |  |  |  |  |
| expires_at | timestamp with time zone |  |  |  |  |
| is_used | bit |  |  |  | default: false |
| qr_code_data | text |  |  |  |  |
| qr_code_url | text |  |  |  |  |
| reference_id | varchar(255) | x |  |  |  |
| scanned_at | timestamp with time zone | x |  |  |  |
| updated_at | timestamp with time zone |  |  |  |  |

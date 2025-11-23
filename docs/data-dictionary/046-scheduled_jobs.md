## 46. Scheduled Jobs Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| created_at | timestamp with time zone |  |  |  |  |
| execute_at | timestamp with time zone |  |  |  |  |
| job_type | varchar(255) |  |  |  |  |
| payload | jsonb |  |  |  |  |
| status | varchar(100) |  |  |  | default: PENDING |
| updated_at | timestamp with time zone |  |  |  |  |

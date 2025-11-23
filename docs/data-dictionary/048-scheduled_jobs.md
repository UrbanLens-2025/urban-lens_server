## 48. Scheduled Jobs Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | varchar(255) |  | x | PK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| execute_at | timestamp with time zone |  |  |  |  |
| job_type | varchar(255) |  |  |  |  |
| payload | jsonb |  |  |  |  |
| status | varchar(100) |  |  |  | default: ScheduledJobStatus.PENDING |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

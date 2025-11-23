## 18. Events Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| account_id | uuid |  |  | FK |  |
| location_id | uuid |  |  | FK |  |
| referenced_event_request_id | uuid |  |  | FK |  |
| scheduled_job_id | int | x |  | FK |  |
| avatar_url | varchar(500) | x |  |  |  |
| cover_url | varchar(500) | x |  |  |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| description | text |  |  |  |  |
| display_name | varchar(255) |  |  |  |  |
| end_date | timestamp with time zone | x |  |  |  |
| has_paid_out | bit |  |  |  | default: false |
| paid_out_at | timestamp with time zone | x |  |  |  |
| refund_policy | text | x |  |  |  |
| social | jsonb | x |  |  |  |
| start_date | timestamp with time zone | x |  |  |  |
| status | varchar(50) |  |  |  |  |
| terms_and_conditions | text | x |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

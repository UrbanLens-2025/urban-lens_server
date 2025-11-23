## 54. Wallet External Transaction Timeline Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| action | varchar(100) |  |  |  |  |
| actor_id | uuid | x |  |  |  |
| actor_name | varchar(255) |  |  |  |  |
| actor_type | varchar(20) |  |  |  | default: SYSTEM' varying |
| created_at | timestamp with time zone |  |  |  |  |
| id | uuid |  |  |  |  |
| metadata | jsonb | x |  |  |  |
| note | text | x |  |  |  |
| primary | varchar | x |  |  |  |
| references | varchar | x |  |  |  |
| references | varchar | x |  |  |  |
| status_changed_to | varchar(20) | x |  |  |  |
| transaction_id | uuid |  |  |  |  |

## 53. Wallet External Transaction Timeline Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| action | varchar(100) |  |  |  |  |
| actor_name | varchar(255) |  |  |  |  |
| actor_type | varchar(20) |  |  |  | default: SYSTEM |
| created_at | timestamp with time zone |  |  |  |  |
| metadata | jsonb | x |  |  |  |
| note | text | x |  |  |  |
| status_changed_to | varchar(20) | x |  |  |  |

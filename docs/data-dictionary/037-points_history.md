## 37. Points History Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| balance_after | int |  |  |  |  |
| balance_before | int |  |  |  |  |
| created_at | timestamp with time zone |  |  |  |  |
| description | text | x |  |  |  |
| points | int |  |  |  |  |
| reference_id | uuid | x |  |  |  |
| transaction_type | varchar(50) |  |  |  |  |
| user_id | uuid |  |  |  |  |

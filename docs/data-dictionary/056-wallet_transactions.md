## 56. Wallet Transactions Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| amount | decimal(12) |  |  |  |  |
| created_at | timestamp with time zone |  |  |  |  |
| currency | varchar(3) |  |  |  |  |
| destination_wallet_id | uuid |  |  |  |  |
| id | uuid |  |  |  |  |
| note | varchar(255) | x |  |  |  |
| primary | varchar | x |  |  |  |
| references | varchar | x |  |  |  |
| references | varchar | x |  |  |  |
| source_wallet_id | uuid |  |  |  |  |
| status | varchar(20) |  |  |  | default: PENDING' varying |
| type | varchar(55) |  |  |  |  |

## 55. Wallet Transactions Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| amount | decimal(12) |  |  |  |  |
| created_at | timestamp with time zone |  |  |  |  |
| currency | varchar(3) |  |  |  |  |
| note | varchar(255) | x |  |  |  |
| status | varchar(20) |  |  |  | default: PENDING |
| type | varchar(55) |  |  |  |  |

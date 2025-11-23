## 57. Wallets Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| balance | decimal(12) |  |  |  | default: 0 |
| created_at | timestamp with time zone |  |  |  |  |
| created_by | uuid |  |  |  |  |
| currency | varchar(3) |  |  |  |  |
| id | uuid |  |  |  |  |
| is_locked | bit |  |  |  | default: false |
| locked_balance | decimal(12) |  |  |  | default: 0 |
| owned_by | uuid | x |  |  |  |
| primary | varchar | x |  |  |  |
| references | varchar | x |  |  |  |
| total_transactions | int |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  |  |
| updated_by | uuid | x |  |  |  |
| wallet_type | varchar(20) |  |  |  | default: USER' varying |

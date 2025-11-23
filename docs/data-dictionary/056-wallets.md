## 56. Wallets Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| balance | decimal(12) |  |  |  | default: 0 |
| created_at | timestamp with time zone |  |  |  |  |
| created_by | uuid |  |  |  |  |
| currency | varchar(3) |  |  |  |  |
| is_locked | bit |  |  |  | default: false |
| locked_balance | decimal(12) |  |  |  | default: 0 |
| total_transactions | int |  |  |  | default: 0 |
| updated_at | timestamp with time zone |  |  |  |  |
| updated_by | uuid | x |  |  |  |
| wallet_type | varchar(20) |  |  |  | default: USER |

## 59. Wallets Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| owned_by | uuid | x |  | FK |  |
| balance | decimal(12,2) |  |  |  | default: 0 |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| created_by | uuid |  |  |  |  |
| currency | varchar(3) |  |  |  |  |
| is_locked | bit |  |  |  | default: false |
| locked_balance | decimal(12,2) |  |  |  | default: 0 |
| total_transactions | int |  |  |  | default: 0 |
| updated_at | timestamp with time zone |  |  |  | auto-generated |
| updated_by | uuid | x |  |  |  |
| wallet_type | varchar(20) |  |  |  | default: WalletType.USER |

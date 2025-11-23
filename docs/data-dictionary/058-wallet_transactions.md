## 58. Wallet Transactions Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| destination_wallet_id | uuid |  |  | FK |  |
| source_wallet_id | uuid |  |  | FK |  |
| amount | decimal(12,2) |  |  |  |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| currency | varchar(3) |  |  |  |  |
| note | varchar(255) | x |  |  |  |
| status | varchar(20) |  |  |  | default: WalletTransactionStatus.PENDING |
| type | varchar(55) |  |  |  |  |

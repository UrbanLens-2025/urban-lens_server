## 55. Wallet External Transactions Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| after_finish_action | varchar(50) |  |  |  | default: NONE' varying |
| amount | decimal(12) |  |  |  |  |
| created_at | timestamp with time zone |  |  |  |  |
| created_by | uuid |  |  |  |  |
| currency | varchar(3) |  |  |  |  |
| direction | varchar(10) |  |  |  |  |
| expires_at | timestamp with time zone | x |  |  |  |
| id | uuid |  |  |  |  |
| payment_url | text | x |  |  |  |
| primary | varchar | x |  |  |  |
| provider | varchar(50) | x |  |  |  |
| provider_response | jsonb | x |  |  |  |
| provider_transaction_id | varchar(255) | x |  |  |  |
| references | varchar | x |  |  |  |
| references | varchar | x |  |  |  |
| status | varchar(20) |  |  |  | default: PENDING' varying |
| updated_at | timestamp with time zone |  |  |  |  |
| wallet_id | uuid |  |  |  |  |
| withdraw_bank_account_name | varchar(255) | x |  |  |  |
| withdraw_bank_account_number | varchar(50) | x |  |  |  |
| withdraw_bank_name | varchar(100) | x |  |  |  |

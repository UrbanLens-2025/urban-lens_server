## 56. Wallet External Transaction Timeline Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| actor_id | uuid | x |  | FK |  |
| transaction_id | uuid |  |  | FK |  |
| action | varchar(100) |  |  |  |  |
| actor_name | varchar(255) |  |  |  |  |
| actor_type | varchar(20) |  |  |  | default: WalletExternalTransactionActor.SYSTEM |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| metadata | jsonb | x |  |  |  |
| note | text | x |  |  |  |
| status_changed_to | varchar(20) | x |  |  |  |

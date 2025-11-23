## 52. User Location Voucher Exchange Histories Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| user_profile_id | varchar(255) |  |  | FK |  |
| voucher_id | varchar(255) |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| point_spent | varchar(255) |  |  |  |  |
| used_at | timestamp with time zone | x |  |  |  |
| user_voucher_code | varchar(255) |  | x |  |  |

## 34. Location Vouchers Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| created_at | timestamp with time zone |  |  |  |  |
| description | varchar(not) |  |  |  |  |
| end_date | timestamp with time zone |  |  |  |  |
| image_url | text | x |  |  |  |
| max_quantity | int |  |  |  | default: 0 |
| price_point | int |  |  |  | default: 0 |
| start_date | timestamp with time zone |  |  |  |  |
| title | varchar(not) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  |  |
| user_redeemed_limit | int |  |  |  | default: 0 |
| voucher_code | varchar(255) |  |  |  |  |
| voucher_type | varchar(50) |  |  |  | default: public |

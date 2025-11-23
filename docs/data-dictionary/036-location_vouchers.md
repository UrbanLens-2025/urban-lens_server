## 36. Location Vouchers Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | varchar(255) |  | x | PK |  |
| location_id | varchar(255) |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| description | varchar(255) |  |  |  |  |
| end_date | timestamp with time zone |  |  |  |  |
| image_url | text | x |  |  |  |
| max_quantity | int |  |  |  | default: 0 |
| price_point | int |  |  |  | default: 0 |
| start_date | timestamp with time zone |  |  |  |  |
| title | varchar(255) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |
| user_redeemed_limit | int |  |  |  | default: 0 |
| voucher_code | varchar(255) |  |  |  |  |
| voucher_type | varchar(50) |  |  |  | default: LocationVoucherType.PUBLIC |

## 29. Location Bookings Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| account_id | uuid |  |  | FK |  |
| location_id | uuid |  |  | FK |  |
| referenced_transaction_id | uuid | x |  | FK |  |
| scheduled_payout_job_id | bigint | x |  | FK |  |
| amount_to_pay | decimal |  |  |  |  |
| booking_object | varchar(100) |  |  |  | default: LocationBookingObject.FOR_EVENT |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| paid_out_at | timestamp with time zone | x |  |  |  |
| soft_locked_until | timestamp with time zone | x |  |  |  |
| status | varchar(55) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

## 27. Location Bookings Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| amount_to_pay | decimal(not) |  |  |  |  |
| booking_object | varchar(100) |  |  |  | default: FOR_EVENT |
| created_at | timestamp with time zone |  |  |  |  |
| paid_out_at | timestamp with time zone | x |  |  |  |
| soft_locked_until | timestamp with time zone | x |  |  |  |
| status | varchar(55) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  |  |

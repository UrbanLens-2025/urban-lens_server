## 27. Location Booking Config Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| location_id | uuid |  | x | PK, FK |  |
| created_by | uuid | x |  | FK |  |
| allow_booking | bit |  |  |  | default: false |
| base_booking_price | decimal(10,2) |  |  |  |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| currency | varchar(3) |  |  |  |  |
| max_booking_duration_minutes | int |  |  |  |  |
| min_booking_duration_minutes | int |  |  |  |  |
| min_gap_between_bookings_minutes | int |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

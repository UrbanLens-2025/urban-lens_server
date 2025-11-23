## 28. Location Booking Dates Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| booking_id | uuid |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| end_date_time | timestamp with time zone |  |  |  |  |
| start_date_time | timestamp with time zone |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

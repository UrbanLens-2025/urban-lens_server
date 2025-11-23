## 11. Event Attendance Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| event_id | uuid |  |  | FK |  |
| order_id | uuid |  |  | FK |  |
| owner_id | uuid | x |  | FK |  |
| referenced_ticket_order_id | uuid |  |  | FK |  |
| ticket_id | uuid |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| owner_email | varchar(255) | x |  |  |  |
| owner_phone_number | varchar(255) | x |  |  |  |
| status | varchar(20) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

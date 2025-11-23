## 16. Event Ticket Order Details Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | int |  | x | PK |  |
| event_ticket_id | uuid |  |  | FK |  |
| ticket_order_id | uuid |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| currency | varchar(3) |  |  |  |  |
| quantity | int |  |  |  |  |
| sub_total | decimal(12,2) |  |  |  |  |
| ticket_snapshot | jsonb |  |  |  |  |
| unit_price | decimal(12,2) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

## 17. Event Ticket Orders Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | varchar(255) |  | x | PK |  |
| created_by_id | uuid |  |  | FK |  |
| event_id | uuid |  |  | FK |  |
| referenced_transaction_id | uuid | x |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| currency | varchar(3) |  |  |  |  |
| order_number | varchar(100) |  |  |  |  |
| status | varchar(20) |  |  |  | default: EventTicketOrderStatus.PENDING |
| total_payment_amount | decimal(12,2) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

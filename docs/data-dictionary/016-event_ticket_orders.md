## 16. Event Ticket Orders Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| created_at | timestamp with time zone |  |  |  |  |
| currency | varchar(3) |  |  |  |  |
| order_number | varchar(100) |  |  |  |  |
| status | varchar(20) |  |  |  | default: PENDING |
| total_payment_amount | decimal(12) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  |  |

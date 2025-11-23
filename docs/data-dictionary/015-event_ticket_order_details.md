## 15. Event Ticket Order Details Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| created_at | timestamp with time zone |  |  |  |  |
| currency | varchar(3) |  |  |  |  |
| quantity | int |  |  |  |  |
| sub_total | decimal(12) |  |  |  |  |
| ticket_snapshot | jsonb |  |  |  |  |
| unit_price | decimal(12) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  |  |

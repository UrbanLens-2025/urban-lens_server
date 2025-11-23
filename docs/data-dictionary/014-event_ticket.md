## 14. Event Ticket Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| created_at | timestamp with time zone |  |  |  |  |
| currency | char(3) |  |  |  | default: USD |
| description | text | x |  |  |  |
| display_name | varchar(255) |  |  |  |  |
| image_url | text | x |  |  |  |
| is_active | bit |  |  |  | default: true |
| max_quantity_per_order | int |  |  |  | default: 5 |
| min_quantity_per_order | int |  |  |  | default: 1 |
| price | decimal(10) |  |  |  |  |
| quantity_reserved | int |  |  |  | default: 0 |
| sale_end_date | timestamp with time zone |  |  |  |  |
| sale_start_date | timestamp with time zone |  |  |  |  |
| tos | text | x |  |  |  |
| total_quantity | int |  |  |  | default: 0 |
| total_quantity_available | int |  |  |  | default: 0 |
| updated_at | timestamp with time zone |  |  |  |  |

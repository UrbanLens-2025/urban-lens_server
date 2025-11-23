## 44. Reacts Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| author_id | varchar(255) |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| entity_id | uuid |  |  |  |  |
| entity_type | varchar(255) |  |  |  |  |
| type | varchar(50) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

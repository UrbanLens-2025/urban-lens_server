## 40. Push Notification Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| created_at | timestamp with time zone |  |  |  |  |
| payload | jsonb |  |  |  |  |
| status | varchar(50) |  |  |  | default: UNSEEN |
| type | varchar(50) |  |  |  |  |

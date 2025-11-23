## 42. Push Notification Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | varchar(255) |  | x | PK |  |
| to_user_id | uuid |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| payload | jsonb |  |  |  |  |
| status | varchar(50) |  |  |  | default: PushNotificationStatus.UNSEEN |
| type | varchar(50) |  |  |  |  |

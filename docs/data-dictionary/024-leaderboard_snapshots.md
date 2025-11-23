## 24. Leaderboard Snapshots Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | varchar(255) |  | x | PK |  |
| user_id | uuid |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| period_type | varchar(20) |  |  |  |  |
| period_value | varchar(50) |  |  |  |  |
| rank_position | int |  |  |  |  |
| ranking_point | int |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

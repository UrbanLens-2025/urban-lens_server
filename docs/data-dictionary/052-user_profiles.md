## 52. User Profiles Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| bio | text | x |  |  |  |
| dob | timestamp with time zone | x |  |  |  |
| points | int |  |  |  | default: 0 |
| rank | varchar(50) | x |  |  |  |
| ranking_point | int |  |  |  | default: 0 |
| tag_scores | jsonb | x |  |  | default: {} |
| total_achievements | int |  |  |  | default: 0 |
| total_blogs | int |  |  |  | default: 0 |
| total_check_ins | int |  |  |  | default: 0 |
| total_followers | int |  |  |  | default: 0 |
| total_following | int |  |  |  | default: 0 |
| total_reviews | int |  |  |  | default: 0 |

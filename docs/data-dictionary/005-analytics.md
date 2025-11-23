## 5. Analytics Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| analytic_id | uuid |  | x | PK |  |
| avg_rating | decimal(3,2) |  |  |  | default: 0 |
| entity_id | uuid | x |  |  |  |
| entity_type | varchar(255) | x |  |  |  |
| total_comments | int |  |  |  | default: 0 |
| total_downvotes | int |  |  |  | default: 0 |
| total_reviews | int |  |  |  | default: 0 |
| total_upvotes | int |  |  |  | default: 0 |
| total_views | int |  |  |  | default: 0 |

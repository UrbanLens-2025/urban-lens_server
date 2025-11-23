## 48. Tag Category Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| applicable_types | jsonb |  |  |  | default: ["USER"] |
| color | varchar(50) | x |  |  |  |
| created_at | timestamp with time zone |  |  |  |  |
| description | text | x |  |  |  |
| icon | varchar(50) | x |  |  |  |
| tag_score_weights | jsonb |  |  |  | default: {} |
| updated_at | timestamp with time zone |  |  |  |  |

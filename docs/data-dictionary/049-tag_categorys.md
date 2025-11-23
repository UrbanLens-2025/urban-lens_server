## 49. Tag Categorys Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | varchar(255) |  | x | PK |  |
| applicable_types | jsonb |  |  |  | default: () => '\'["USER"]\'' |
| created_at | timestamp with time zone |  |  |  | default: () => 'CURRENT_TIMESTAMP' |
| tag_score_weights | jsonb |  |  |  | default: { |
| updated_at | timestamp with time zone |  |  |  | default: () => 'CURRENT_TIMESTAMP' |

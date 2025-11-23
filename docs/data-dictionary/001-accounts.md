## 1. Accounts Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| avatar_url | varchar | x |  |  |  |
| cover_url | varchar | x |  |  |  |
| created_at | timestamp with time zone |  |  |  |  |
| first_name | varchar(255) |  |  |  |  |
| has_onboarded | bit |  |  |  | default: false |
| is_locked | bit |  |  |  | default: false |
| last_name | varchar(255) |  |  |  |  |
| password | varchar(255) |  |  |  |  |
| phone_number | varchar(255) |  |  |  |  |
| role | varchar(50) |  |  |  | default: USER |
| updated_at | timestamp with time zone |  |  |  |  |

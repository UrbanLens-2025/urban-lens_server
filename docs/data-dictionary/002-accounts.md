## 2. Accounts Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | varchar(255) |  | x | PK |  |
| avatar_url | varchar(255) | x |  |  |  |
| cover_url | varchar(255) | x |  |  |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| email | varchar(255) |  | x |  |  |
| first_name | varchar(255) |  |  |  |  |
| has_onboarded | bit |  |  |  | default: false |
| is_locked | bit |  |  |  | default: false |
| last_name | varchar(255) |  |  |  |  |
| password | varchar(255) |  |  |  |  |
| phone_number | varchar(255) |  |  |  |  |
| role | varchar(50) |  |  |  | default: Role.USER |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

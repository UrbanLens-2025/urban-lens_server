## 50. Tags Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | varchar(255) |  | x | PK |  |
| color | varchar(50) |  |  |  |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| display_name | varchar(255) |  |  |  |  |
| display_name_normalized | varchar(255) |  |  |  |  |
| group_name | varchar(100) |  |  |  | default: TagGroup.USER_TYPE |
| icon | varchar(10) |  |  |  |  |
| is_selectable | bit |  |  |  | default: true |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

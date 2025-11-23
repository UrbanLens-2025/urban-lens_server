## 35. Locations Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| address_level_1 | varchar(100) |  |  |  |  |
| address_level_2 | varchar(100) |  |  |  |  |
| address_line | varchar(255) |  |  |  |  |
| created_at | timestamp with time zone |  |  |  |  |
| description | text |  |  |  |  |
| geom | geography | x |  |  |  |
| image_url | text | x |  |  |  |
| is_visible_on_map | bit |  |  |  | default: false |
| latitude | decimal(10) |  |  |  |  |
| longitude | decimal(11) |  |  |  |  |
| name | varchar(255) |  |  |  |  |
| ownership_type | varchar(50) |  |  |  | default: OWNED_BY_BUSINESS |
| radius_meters | int |  |  |  | default: 0 |
| updated_at | timestamp with time zone |  |  |  |  |

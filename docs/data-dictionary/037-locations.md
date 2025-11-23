## 37. Locations Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| business_id | uuid | x |  | FK |  |
| source_location_request_id | uuid | x |  | FK |  |
| updated_by | uuid | x |  | FK |  |
| address_level_1 | varchar(100) |  |  |  |  |
| address_level_2 | varchar(100) |  |  |  |  |
| address_line | varchar(255) |  |  |  |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| description | text |  |  |  |  |
| geom | geography | x |  |  |  |
| image_url | text | x |  |  |  |
| is_visible_on_map | bit |  |  |  | default: false |
| latitude | decimal(10,8) |  |  |  |  |
| longitude | decimal(11,8) |  |  |  |  |
| name | varchar(255) |  |  |  |  |
| ownership_type | varchar(50) |  |  |  | default: LocationOwnershipType.OWNED_BY_BUSINESS |
| radius_meters | int |  |  |  | default: 0 |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

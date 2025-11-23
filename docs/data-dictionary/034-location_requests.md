## 34. Location Requests Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| created_by | uuid |  |  | FK |  |
| processed_by | uuid | x |  | FK |  |
| address_level_1 | varchar(100) |  |  |  |  |
| address_level_2 | varchar(100) |  |  |  |  |
| address_line | varchar(255) |  |  |  |  |
| admin_notes | text | x |  |  |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| description | text |  |  |  |  |
| latitude | decimal(10,8) |  |  |  |  |
| location_image_urls | text | x |  |  |  |
| location_validation_documents | jsonb | x |  |  |  |
| longitude | decimal(11,8) |  |  |  |  |
| name | varchar(255) |  |  |  |  |
| radius_meters | int |  |  |  | default: 0 |
| status | varchar(50) |  |  |  | default: LocationRequestStatus.AWAITING_ADMIN_REVIEW |
| type | varchar(50) |  |  |  | default: LocationRequestType.BUSINESS_OWNED |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

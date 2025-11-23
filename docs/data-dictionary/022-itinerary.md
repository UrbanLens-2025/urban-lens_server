## 22. Itinerary Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| user_id | uuid |  |  | FK |  |
| ai_metadata | jsonb | x |  |  |  |
| album | text |  |  |  | default: [] |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| description | text | x |  |  |  |
| end_date | date | x |  |  |  |
| location_wishlist | uuid |  |  |  | default: [] |
| source | varchar(20) |  |  |  | default: ItinerarySource.MANUAL |
| start_date | date | x |  |  |  |
| thumbnail_url | text | x |  |  |  |
| title | varchar(255) |  |  |  |  |
| total_distance_km | double precision |  |  |  | default: 0 |
| total_travel_minutes | int |  |  |  | default: 0 |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

## 23. Itinerary Location Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| itinerary_id | uuid |  |  | FK |  |
| location_id | uuid |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| notes | text | x |  |  |  |
| order | int |  |  |  |  |
| travel_distance_km | double precision | x |  |  |  |
| travel_duration_minutes | int | x |  |  |  |

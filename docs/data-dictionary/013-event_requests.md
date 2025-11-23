## 13. Event Requests Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | uuid |  | x | PK |  |
| created_by_id | uuid |  |  | FK |  |
| referenced_event_id | uuid | x |  | FK |  |
| referenced_location_booking_id | uuid | x |  | FK |  |
| allow_tickets | bit |  |  |  |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| event_description | text |  |  |  |  |
| event_name | varchar(255) |  |  |  |  |
| event_validation_documents | jsonb | x |  |  |  |
| expected_number_of_participants | int |  |  |  |  |
| social | jsonb | x |  |  |  |
| special_requirements | text |  |  |  |  |
| status | varchar(55) |  |  |  |  |
| updated_at | timestamp with time zone |  |  |  | auto-generated |

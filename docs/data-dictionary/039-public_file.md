## 39. Public File Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| created_at | timestamp with time zone |  |  |  |  |
| file_mime_type | varchar(100) |  |  |  |  |
| file_name | varchar(1000) |  |  |  |  |
| file_size_mb | decimal(not) |  |  |  |  |
| file_url | varchar(2000) | x |  |  |  |
| status | varchar(50) |  |  |  | default: AWAITING_UPLOAD |

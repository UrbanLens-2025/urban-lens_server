## 41. Public Files Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| id | varchar(255) |  | x | PK |  |
| created_by | varchar(255) |  |  | FK |  |
| created_at | timestamp with time zone |  |  |  | auto-generated |
| file_mime_type | varchar(100) |  |  |  |  |
| file_name | varchar(1000) |  |  |  |  |
| file_size_mb | decimal |  |  |  |  |
| file_url | varchar(2000) | x |  |  |  |
| status | varchar(50) |  |  |  | default: PublicFileStatus.AWAITING_UPLOAD |

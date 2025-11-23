## 4. Address Ward Table

| Field name | Type | Allow nulls | Unique | PK/FK | Note |
|------------|------|--------------|--------|-------|------|
| code | varchar(255) |  | x | PK |  |
| province_code | varchar(16) |  |  | FK |  |
| administrative_level | varchar(128) |  |  |  |  |
| is_visible | bit |  |  |  | default: true |

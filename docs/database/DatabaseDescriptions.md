# Database Description

## 2.2 Database Description

| ID  | Entity Name              | Description                                                                                                                                                                                                                    |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `wallet_transactions`    | An entity that represents internal wallet-to-wallet transactions in the system such as transaction code, amount, currency, type, and status.                                                                                   |
| 2   | `address_province`       | An entity that stores Vietnamese province/administrative level 1 data including province code, name, administrative level, and visibility status.                                                                              |
| 3   | `address_ward`           | An entity that stores Vietnamese ward/administrative level 3 data including ward code, name, administrative level, associated province code, and visibility status.                                                            |
| 4   | `favorite_locations`     | An entity that represents user's favorite locations, linking accounts to locations they have marked as favorites with creation timestamp.                                                                                      |
| 5   | `leaderboard_snapshots`  | An entity that stores historical leaderboard rankings for users across different periods (weekly, monthly, yearly, seasonal) including ranking points and position.                                                            |
| 6   | `location_opening_hours` | An entity that stores business hours for locations, including day of week, start time, and end time for each location.                                                                                                         |
| 7   | `one_time_qr_codes`      | An entity that represents temporary QR codes generated for location check-ins or transactions, including QR code data, scan status, expiration time, and reference to orders or transactions.                                  |
| 8   | `points_history`         | An entity that tracks all point transactions for users including points earned/spent, transaction type (check-in, create blog/review/comment, mission, redeem, admin adjustment), balance before and after, and reference IDs. |
| 9   | `report_reasons`         | An entity that stores predefined reasons for reporting content (events, locations, posts) including display name, description, active status, priority, and applicable entity types.                                           |
| 10  | `scheduled_job`          | An entity that manages scheduled background jobs in the system including job type, execution time, payload data, associated entity ID, status, and completion timestamp.                                                       |

# Personal Journey API Examples

## Endpoint

`POST /journey/personal`

## Authentication

Bearer token required

## Request Examples

### 1. Basic Journey (Current Location Only)

```json
{
  "numberOfLocations": 5,
  "currentLatitude": 10.762622,
  "currentLongitude": 106.660172
}
```

### 2. Journey with Preferred Area

```json
{
  "numberOfLocations": 8,
  "currentLatitude": 10.762622,
  "currentLongitude": 106.660172,
  "preferredAreaLatitude": 10.775,
  "preferredAreaLongitude": 106.695,
  "preferredAreaRadiusKm": 3,
  "maxRadiusKm": 10
}
```

### 3. Journey with End Point

```json
{
  "numberOfLocations": 6,
  "currentLatitude": 10.762622,
  "currentLongitude": 106.660172,
  "endLatitude": 10.782622,
  "endLongitude": 106.680172,
  "maxRadiusKm": 15
}
```

### 4. Complete Journey (All Options)

```json
{
  "numberOfLocations": 10,
  "currentLatitude": 10.762622,
  "currentLongitude": 106.660172,
  "preferredAreaLatitude": 10.775,
  "preferredAreaLongitude": 106.695,
  "preferredAreaRadiusKm": 5,
  "endLatitude": 10.782622,
  "endLongitude": 106.680172,
  "maxRadiusKm": 20
}
```

## Response Example

```json
{
  "data": {
    "locations": [
      {
        "id": "967057d6-6f4d-4a1e-9762-0e5fc9d4c5e5",
        "name": "The Coffee House Signature",
        "description": "Premium coffee with cozy atmosphere",
        "addressLine": "123 Nguyen Hue, District 1, HCMC",
        "latitude": 10.775847,
        "longitude": 106.704365,
        "imageUrl": "https://example.com/coffee-house.jpg",
        "preferenceScore": 85.5,
        "distanceFromPrevious": 2.3,
        "estimatedTravelTimeMinutes": 15,
        "order": 1,
        "matchingTags": ["coffee", "cozy", "wifi", "work-friendly"]
      },
      {
        "id": "abc123...",
        "name": "Saigon Opera House",
        "description": "Historic landmark with beautiful architecture",
        "addressLine": "7 Cong Truong Lam Son, District 1, HCMC",
        "latitude": 10.777134,
        "longitude": 106.702777,
        "imageUrl": "https://example.com/opera-house.jpg",
        "preferenceScore": 78.2,
        "distanceFromPrevious": 0.8,
        "estimatedTravelTimeMinutes": 5,
        "order": 2,
        "matchingTags": ["architecture", "history", "culture"]
      }
      // ... more locations
    ],
    "totalDistanceKm": 12.5,
    "estimatedTotalTimeMinutes": 90,
    "averagePreferenceScore": 82.3,
    "optimizationScore": 145.8
  },
  "success": true,
  "message": "Successfully created personalized journey"
}
```

## Algorithm Details

### Location Selection

1. **Tag Matching**: Locations are scored based on how well their tags match user preferences
   - Each tag match contributes to the preference score
   - Score normalized to 0-100 scale

2. **Preference Score Calculation**:
   ```
   preferenceScore = min(100, (totalTagScore / matchCount) * 2)
   ```

### Route Optimization

1. **Greedy Nearest Neighbor**: Balances preference and distance
   - 70% weight on preference score
   - 30% weight on distance penalty
2. **Composite Score**:

   ```
   compositeScore = preferenceScore * 0.7 + distancePenalty * 0.3
   distancePenalty = max(0, 100 - distance * 10)
   ```

3. **End Point Optimization**: If end point specified, last segment is reordered to approach the destination

### Travel Time Estimation

- Average city speed: 30 km/h
- Formula: `travelTime = (distance / 30) * 60` minutes

### Optimization Score

Lower is better:

```
optimizationScore = totalDistance * 10 + preferenceVariance
```

## Error Responses

### No User Profile

```json
{
  "success": false,
  "message": "User profile not found or has no preference data",
  "statusCode": 404
}
```

### No Locations Found

```json
{
  "success": false,
  "message": "No locations found in the specified area. Try increasing the search radius.",
  "statusCode": 404
}
```

### Invalid Input

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "numberOfLocations must be at least 2",
    "maxRadiusKm must not be greater than 50"
  ],
  "statusCode": 400
}
```

## Testing Tips

1. **Build User Preferences First**: Ensure user has tag scores from:
   - Check-ins (5 points per tag)
   - Upvotes (2 points per tag)
   - Downvotes (-1 point per tag)
   - Reviews (+2 to -2 points based on rating)

2. **Start Small**: Test with 3-5 locations first

3. **Check Coverage**: Ensure search area has enough locations with tags

4. **Monitor Performance**: Large radius or many locations may take longer

5. **Verify Route Logic**: Check that locations are reasonably connected

## Swagger Documentation

Available at: `/api#/Journey%20Planning/JourneyPlannerController_createPersonalJourney`

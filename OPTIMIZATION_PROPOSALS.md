# Đề xuất tối ưu cho AI Journey Planning Flow

## 🔍 Phân tích bottlenecks hiện tại

### 1. **Sequential Operations** (Có thể parallelize)

- AI call → Location fetching → Route optimization → Distance calculation
- Một số operations có thể chạy song song

### 2. **Database Queries** (Có thể optimize)

- User profile query (có thể cache)
- Location queries (có thể batch tốt hơn)
- Tags loading (chỉ load khi cần)

### 3. **Route Optimization** (Có thể tối ưu)

- optimizeRoute và calculateRouteMetrics có thể combine
- Google Maps calls đã batch nhưng có thể tối ưu thêm

## 🚀 Đề xuất tối ưu

### Priority 1: High Impact, Easy Implementation

#### 1.1. Parallelize Location Fetching với Route Preparation

```typescript
// Current: Sequential
const aiResponse = await ollamaService.generateJourneyWithDBAccess(...);
let locations = await locationRepository.findByIds(locationIds);

// Optimized: Parallel
const [aiResponse, locationPreload] = await Promise.all([
  ollamaService.generateJourneyWithDBAccess(...),
  // Pre-fetch common locations trong radius để có sẵn data
  locationRepository.findNearbyWithTags(startPoint.lat, startPoint.lng, maxRadiusKm, 20)
]);
```

#### 1.2. Early Validation & Fail Fast

```typescript
// Validate AI response ngay sau khi nhận được
if (!aiResponse?.suggestedLocationIds?.length) {
  throw new BadRequestException('AI failed...');
  // Không cần tiếp tục các operations khác
}
```

#### 1.3. Skip Unnecessary Calculations

```typescript
// Chỉ tính preference score nếu cần (hiện tại luôn tính)
// Có thể skip nếu AI đã chọn locations
if (needPreferenceScore) {
  // Calculate scores
}
```

### Priority 2: Medium Impact, Medium Effort

#### 2.1. Cache User Profile

```typescript
// Cache user profile với TTL 5-10 phút
@Cacheable('user-profile', 600) // 10 minutes
async findByAccountId(userId: string) {
  // ...
}
```

#### 2.2. Combine Route Optimization & Distance Calculation

```typescript
// Current: optimizeRoute → calculateRouteMetrics (2 passes)
// Optimized: Single pass với distance calculation tích hợp
async optimizeRouteWithMetrics(
  start: RoutePoint,
  candidates: LocationCandidate[],
  end?: RoutePoint
): Promise<RouteWithMetrics> {
  // Optimize và calculate distances trong 1 pass
}
```

#### 2.3. Batch Location Metadata Loading

```typescript
// Load tags và ratings sau khi đã có location IDs
// Không cần load trong initial query
const locationIds = aiResponse.suggestedLocationIds;
const [locations, metadata] = await Promise.all([
  locationRepository.findByIds(locationIds),
  locationRepository.loadMetadataBatch(locationIds), // tags, ratings
]);
```

### Priority 3: High Impact, High Effort

#### 3.1. Pre-compute Route Optimization

```typescript
// Cache optimized routes cho common start/end points
// Hoặc pre-compute routes cho popular locations
@Cacheable('route-cache', 3600)
async getOptimizedRoute(startId: string, locationIds: string[]) {
  // ...
}
```

#### 3.2. Stream AI Response

```typescript
// Nếu AI model support streaming
// Có thể bắt đầu process locations ngay khi AI trả về UUID đầu tiên
const stream = ollamaService.generateJourneyStream(...);
for await (const chunk of stream) {
  if (chunk.locationIds) {
    // Start fetching locations ngay
  }
}
```

#### 3.3. Database Query Optimization

```typescript
// Sử dụng materialized view cho nearby locations
// Hoặc spatial index optimization
CREATE INDEX idx_locations_spatial ON locations USING GIST (
  ll_to_earth(latitude, longitude)
);
```

## 📊 Ước tính cải thiện

| Optimization               | Time Saved  | Complexity | Priority |
| -------------------------- | ----------- | ---------- | -------- |
| Parallelize location fetch | ~200-500ms  | Low        | P1       |
| Early validation           | ~100-300ms  | Low        | P1       |
| Cache user profile         | ~50-100ms   | Medium     | P2       |
| Combine route ops          | ~100-200ms  | Medium     | P2       |
| Batch metadata             | ~100-200ms  | Medium     | P2       |
| Pre-compute routes         | ~500-1000ms | High       | P3       |

**Total potential improvement: ~1-2 seconds** (từ ~6-8s xuống ~4-6s)

## 🎯 Recommended Implementation Order

1. **Week 1**: Priority 1 optimizations (Parallelize, Early validation)
2. **Week 2**: Priority 2 optimizations (Cache, Combine operations)
3. **Week 3**: Priority 3 optimizations (Advanced caching, Streaming)

## ⚠️ Considerations

- **Cache invalidation**: Cần strategy rõ ràng cho user profile cache
- **Error handling**: Parallel operations cần error handling tốt hơn
- **Memory usage**: Caching sẽ tăng memory usage
- **Testing**: Cần test kỹ với parallel operations

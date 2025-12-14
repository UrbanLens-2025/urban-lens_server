# Ranking Points trong Leaderboard Snapshot

## Tổng quan

Ranking points trong leaderboard snapshot được lấy từ field `rankingPoint` trong bảng `user_profiles` tại thời điểm snapshot được tạo.

---

## Nguồn dữ liệu

### 1. Database Field
- **Table**: `user_profiles`
- **Column**: `ranking_point` (integer, default: 0)
- **Entity**: `UserProfileEntity.rankingPoint`

### 2. Cách snapshot lấy điểm

Khi snapshot được tạo (qua cron job hoặc manual), code sẽ:

```typescript
// Lấy tất cả user profiles, sắp xếp theo ranking_point giảm dần
const userProfiles = await userProfileRepo
  .createQueryBuilder('userProfile')
  .leftJoin('userProfile.account', 'account')
  .where('account.role = :role', { role: 'user' })
  .select(['userProfile.accountId', 'userProfile.rankingPoint'])
  .orderBy('userProfile.ranking_point', 'DESC')
  .getMany();

// Lưu vào snapshot với rank position
snapshots = userProfiles.map((profile, index) => ({
  userId: profile.accountId,
  rankingPoint: profile.rankingPoint,  // ← Điểm tại thời điểm snapshot
  rankPosition: index + 1,
}));
```

**Lưu ý quan trọng**: 
- Snapshot lưu điểm tại thời điểm snapshot được tạo
- Điểm trong snapshot KHÔNG thay đổi sau khi snapshot đã được tạo
- Điểm hiện tại của user có thể khác với điểm trong snapshot cũ

---

## Cách Ranking Points được cập nhật

Ranking points được cộng vào khi user thực hiện các hành động sau:

### 1. Check-in tại Location
- **Event**: `CHECK_IN_CREATED_EVENT`
- **Listener**: `CheckInCreatedListener`
- **Reward Type**: `RewardPointType.CHECK_IN`
- **Transaction Type**: `PointsTransactionType.CHECK_IN`
- **Điểm**: Lấy từ bảng `reward_points` (có thể cấu hình)

```typescript
// Khi user check-in
await this.userPointsService.addPoints(
  userId,
  rewardPoint.points,  // Số điểm từ reward_points table
  PointsTransactionType.CHECK_IN,
  `Check-in at location ${locationId}`,
  checkInId,
);
```

### 2. Tạo Blog Post
- **Event**: `POST_CREATED_EVENT` (khi `postType === PostType.BLOG`)
- **Listener**: `PostCreatedListener`
- **Reward Type**: `RewardPointType.CREATE_BLOG`
- **Transaction Type**: `PointsTransactionType.CREATE_BLOG`
- **Điểm**: Lấy từ bảng `reward_points`

```typescript
// Khi user tạo blog post
await this.userPointsService.addPoints(
  authorId,
  rewardPoint.points,
  PointsTransactionType.CREATE_BLOG,
  `Created blog`,
  postId,
);
```

### 3. Tạo Review Post
- **Event**: `POST_CREATED_EVENT` (khi `postType === PostType.REVIEW`)
- **Listener**: `PostCreatedListener`
- **Reward Type**: `RewardPointType.CREATE_REVIEW`
- **Transaction Type**: `PointsTransactionType.CREATE_REVIEW`
- **Điểm**: Lấy từ bảng `reward_points`

```typescript
// Khi user tạo review post
await this.userPointsService.addPoints(
  authorId,
  rewardPoint.points,
  PointsTransactionType.CREATE_REVIEW,
  `Created review`,
  postId,
);
```

### 4. Tạo Comment
- **Event**: `COMMENT_CREATED_EVENT`
- **Listener**: `CommentCreatedListener`
- **Reward Type**: `RewardPointType.CREATE_COMMENT`
- **Transaction Type**: `PointsTransactionType.CREATE_COMMENT`
- **Điểm**: Lấy từ bảng `reward_points`

```typescript
// Khi user tạo comment
await this.userPointsService.addPoints(
  authorId,
  rewardPoint.points,
  PointsTransactionType.CREATE_COMMENT,
  `Created comment on post ${postId}`,
  commentId,
);
```

---

## Cơ chế cập nhật điểm

### Service: `UserPointsService.addPoints()`

```typescript
async addPoints(
  userId: string,
  points: number,
  transactionType: PointsTransactionType,
  description?: string,
  referenceId?: string,
): Promise<void>
```

**Quy trình**:
1. Tìm `UserProfile` của user
2. Cộng điểm vào `userProfile.rankingPoint`
3. Lưu lại `UserProfile`
4. Ghi log vào `points_history` (lịch sử giao dịch điểm)
5. Cập nhật rank của user (dựa trên điểm mới)

**Ví dụ**:
```typescript
// Trước: rankingPoint = 100
userProfile.rankingPoint += 10;  // Thêm 10 điểm
// Sau: rankingPoint = 110
await userProfileRepo.save(userProfile);
```

---

## Bảng Reward Points

Điểm số cho mỗi hành động được lưu trong bảng `reward_points`:

| Type | Description | Points (có thể cấu hình) |
|------|-------------|-------------------------|
| `CREATE_BLOG` | Tạo blog post | X |
| `CREATE_REVIEW` | Tạo review post | Y |
| `CREATE_COMMENT` | Tạo comment | Z |
| `CHECK_IN` | Check-in tại location | W |
| `SHARE_BLOG` | Share blog (chưa implement) | - |
| `SHARE_ITINERARY` | Share itinerary (chưa implement) | - |

**Lưu ý**: Điểm số có thể được cấu hình qua API hoặc database, không hardcode trong code.

---

## Snapshot Timing

### Khi nào snapshot được tạo?

1. **Weekly Snapshot**: Đầu mỗi tuần (cron job)
2. **Monthly Snapshot**: Đầu mỗi tháng (cron job)
3. **Yearly Snapshot**: Đầu mỗi năm (cron job)
4. **Seasonal Snapshot**: Đầu mỗi mùa (cron job)

### Cron Jobs

```typescript
// Weekly - Chạy đầu tuần
@Cron('0 0 * * 1')  // 00:00 mỗi thứ 2
calculateWeeklySnapshot()

// Monthly - Chạy đầu tháng
@Cron('0 0 1 * *')  // 00:00 ngày 1 mỗi tháng
calculateMonthlySnapshot()

// Yearly - Chạy đầu năm
@Cron('0 0 1 1 *')  // 00:00 ngày 1 tháng 1
calculateYearlySnapshot()

// Seasonal - Chạy đầu mùa
calculateSeasonalSnapshot()
```

---

## Ví dụ thực tế

### Scenario 1: User tạo blog post

1. User tạo blog post → `POST_CREATED_EVENT` được emit
2. `PostCreatedListener` nhận event
3. Lấy điểm từ `reward_points` (ví dụ: 10 điểm cho CREATE_BLOG)
4. Gọi `userPointsService.addPoints(userId, 10, CREATE_BLOG)`
5. `userProfile.rankingPoint` tăng từ 100 → 110
6. Lưu vào database
7. Ghi log vào `points_history`

### Scenario 2: Snapshot được tạo

1. Cron job chạy vào đầu tháng
2. Lấy tất cả user profiles, sắp xếp theo `ranking_point` DESC
3. User A: 500 điểm → Rank 1
4. User B: 300 điểm → Rank 2
5. User C: 200 điểm → Rank 3
6. Lưu vào `leaderboard_snapshots` với `periodValue = "2025-01"`

### Scenario 3: User xem snapshot cũ

1. User gọi API: `GET /user/account/leaderboard/snapshot?periodType=monthly&periodValue=2025-01`
2. Query `leaderboard_snapshots` với `periodType='monthly'` và `periodValue='2025-01'`
3. Trả về ranking tại thời điểm tháng 1/2025
4. Điểm trong snapshot KHÔNG thay đổi, dù user hiện tại có điểm cao hơn

---

## Lưu ý quan trọng

### 1. Snapshot là Historical Data
- Snapshot lưu điểm tại thời điểm snapshot được tạo
- Điểm trong snapshot KHÔNG tự động cập nhật
- Để có ranking mới nhất, cần tạo snapshot mới

### 2. Ranking Points vs Snapshot Points
- **Ranking Points (hiện tại)**: `user_profiles.ranking_point` (luôn cập nhật)
- **Snapshot Points**: `leaderboard_snapshots.ranking_point` (cố định tại thời điểm snapshot)

### 3. Real-time Leaderboard
- Endpoint `/user/account/leaderboard` trả về ranking real-time
- Endpoint `/user/account/leaderboard/snapshot` trả về ranking historical
- Nếu snapshot không tồn tại và query current period, sẽ fallback về real-time leaderboard

---

## Code References

### Key Files
- `src/modules/gamification/app/impl/LeaderboardSnapshot.service.ts` - Tạo snapshot
- `src/modules/gamification/app/impl/UserPoints.service.ts` - Cập nhật điểm
- `src/modules/account/domain/UserProfile.entity.ts` - Entity chứa rankingPoint
- `src/modules/gamification/domain/LeaderboardSnapshot.entity.ts` - Entity snapshot

### Key Methods
- `LeaderboardSnapshotService.calculateAndSaveSnapshot()` - Tạo snapshot
- `UserPointsService.addPoints()` - Cộng điểm
- `PostCreatedListener.handleEvent()` - Xử lý khi tạo post
- `CommentCreatedListener.handleEvent()` - Xử lý khi tạo comment
- `CheckInCreatedListener.handleEvent()` - Xử lý khi check-in

---

## Tóm tắt

**Ranking points trong leaderboard snapshot được lấy từ:**
1. Field `ranking_point` trong bảng `user_profiles`
2. Tại thời điểm snapshot được tạo (qua cron job)
3. Điểm được cộng vào khi user:
   - Check-in tại location
   - Tạo blog post
   - Tạo review post
   - Tạo comment
4. Số điểm cho mỗi hành động được cấu hình trong bảng `reward_points`

**Snapshot lưu điểm cố định**, không thay đổi sau khi được tạo, để có thể xem lại ranking tại các thời điểm trong quá khứ.


import {
  PaginationParams,
  PaginationResult,
} from '@/common/services/base.service';

export const IDashboardService = Symbol('IDashboardService');

export interface IDashboardService {
  /**
   * Get dashboard statistics overview
   */
  getOverview(): Promise<DashboardOverviewDto>;

  /**
   * Get user statistics
   */
  getUserStats(
    params: PaginationParams,
  ): Promise<PaginationResult<UserStatsDto>>;

  /**
   * Get post statistics
   */
  getPostStats(
    params: PaginationParams,
  ): Promise<PaginationResult<PostStatsDto>>;

  /**
   * Get location statistics
   */
  getLocationStats(
    params: PaginationParams,
  ): Promise<PaginationResult<LocationStatsDto>>;

  /**
   * Get event statistics
   */
  getEventStats(
    params: PaginationParams,
  ): Promise<PaginationResult<EventStatsDto>>;
}

export interface DashboardOverviewDto {
  totalUsers: number;
  totalPosts: number;
  totalLocations: number;
  totalEvents: number;
  totalCheckIns: number;
  totalReactions: number;
  totalComments: number;
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
}

export interface UserStatsDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  hasOnboarded: boolean;
  isLocked: boolean;
  totalPosts: number;
  totalCheckIns: number;
  totalFollowers: number;
  totalFollowing: number;
  createdAt: Date;
}

export interface PostStatsDto {
  postId: string;
  authorId: string;
  authorName: string;
  type: string;
  totalUpvotes: number;
  totalDownvotes: number;
  totalComments: number;
  isVerified: boolean;
  isHidden: boolean;
  createdAt: Date;
}

export interface LocationStatsDto {
  locationId: string;
  name: string;
  addressLine: string;
  totalCheckIns: number;
  totalPosts: number;
  averageRating: number;
  isVisibleOnMap: boolean;
  createdAt: Date;
}

export interface EventStatsDto {
  eventId: string;
  displayName: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  totalTickets: number;
  soldTickets: number;
  createdAt: Date;
}

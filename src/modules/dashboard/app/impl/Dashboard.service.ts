import { Injectable } from '@nestjs/common';
import { IDashboardService } from '../IDashboard.service';
import {
  DashboardOverviewDto,
  UserStatsDto,
  PostStatsDto,
  LocationStatsDto,
  EventStatsDto,
} from '../IDashboard.service';
import { CoreService } from '@/common/core/Core.service';
import {
  PaginationParams,
  PaginationResult,
} from '@/common/services/base.service';
import { AccountRepository } from '@/modules/account/infra/repository/Account.repository';
import { PostRepository } from '@/modules/post/infra/repository/Post.repository';
import { LocationRepository } from '@/modules/business/infra/repository/Location.repository';
import { CheckInRepository } from '@/modules/business/infra/repository/CheckIn.repository';
import { ReactRepository } from '@/modules/post/infra/repository/React.repository';
import { CommentRepository } from '@/modules/post/infra/repository/Comment.repository';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { PostEntity } from '@/modules/post/domain/Post.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { CheckInEntity } from '@/modules/business/domain/CheckIn.entity';
import { ReactEntity } from '@/modules/post/domain/React.entity';
import { CommentEntity } from '@/modules/post/domain/Comment.entity';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';

@Injectable()
export class DashboardService extends CoreService implements IDashboardService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly postRepository: PostRepository,
    private readonly locationRepository: LocationRepository,
    private readonly checkInRepository: CheckInRepository,
    private readonly reactRepository: ReactRepository,
    private readonly commentRepository: CommentRepository,
    private readonly userProfileRepository: UserProfileRepository,
  ) {
    super();
  }

  async getOverview(): Promise<DashboardOverviewDto> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all counts in parallel
    const [
      totalUsers,
      totalPosts,
      totalLocations,
      totalEvents,
      totalCheckIns,
      totalReactions,
      totalComments,
      newUsersLast7Days,
      newUsersLast30Days,
      activeUsersLast7Days,
      activeUsersLast30Days,
    ] = await Promise.all([
      // Total users
      this.accountRepository.repo.count(),

      // Total posts
      this.postRepository.repo.count({
        where: { isHidden: false },
      }),

      // Total locations
      this.locationRepository.repo.count(),

      // Total events
      this.dataSource.getRepository(EventEntity).count(),

      // Total check-ins
      this.checkInRepository.repo.count(),

      // Total reactions
      this.reactRepository.repo.count(),

      // Total comments
      this.commentRepository.repo.count(),

      // New users last 7 days
      this.accountRepository.repo
        .createQueryBuilder('account')
        .where('account.created_at >= :date', { date: sevenDaysAgo })
        .getCount(),

      // New users last 30 days
      this.accountRepository.repo
        .createQueryBuilder('account')
        .where('account.created_at >= :date', { date: thirtyDaysAgo })
        .getCount(),

      // Active users last 7 days
      this.getActiveUsersCount(sevenDaysAgo),

      // Active users last 30 days
      this.getActiveUsersCount(thirtyDaysAgo),
    ]);

    return {
      totalUsers,
      totalPosts,
      totalLocations,
      totalEvents,
      totalCheckIns,
      totalReactions,
      totalComments,
      activeUsersLast7Days,
      activeUsersLast30Days,
      newUsersLast7Days,
      newUsersLast30Days,
    };
  }

  /**
   * Get count of active users (users with activity) since a date
   */
  private async getActiveUsersCount(sinceDate: Date): Promise<number> {
    // Get unique user IDs from posts, check-ins, comments, and reacts
    const [postAuthors, checkInUsers, commentAuthors, reactAuthors] =
      await Promise.all([
        this.postRepository.repo
          .createQueryBuilder('post')
          .select('DISTINCT post.author_id', 'authorId')
          .where('post.created_at >= :date', { date: sinceDate })
          .getRawMany(),

        this.checkInRepository.repo
          .createQueryBuilder('checkIn')
          .select('DISTINCT checkIn.user_profile_id', 'userId')
          .where('checkIn.created_at >= :date', { date: sinceDate })
          .getRawMany(),

        this.commentRepository.repo
          .createQueryBuilder('comment')
          .select('DISTINCT comment.author_id', 'authorId')
          .where('comment.created_at >= :date', { date: sinceDate })
          .getRawMany(),

        this.reactRepository.repo
          .createQueryBuilder('react')
          .select('DISTINCT react.author_id', 'authorId')
          .where('react.created_at >= :date', { date: sinceDate })
          .getRawMany(),
      ]);

    // Combine all unique user IDs
    const userIds = new Set<string>();
    postAuthors.forEach((p) => userIds.add(p.authorId));
    checkInUsers.forEach((c) => userIds.add(c.userId));
    commentAuthors.forEach((c) => userIds.add(c.authorId));
    reactAuthors.forEach((r) => userIds.add(r.authorId));

    return userIds.size;
  }

  private normalizePaginationParams(params: PaginationParams = {}): {
    page: number;
    limit: number;
    skip: number;
  } {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private buildPaginationMeta(page: number, limit: number, totalItems: number) {
    const totalPages = Math.ceil(totalItems / limit);
    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async getUserStats(
    params: PaginationParams,
  ): Promise<PaginationResult<UserStatsDto>> {
    const { page, limit, skip } = this.normalizePaginationParams(params);

    const queryBuilder = this.accountRepository.repo
      .createQueryBuilder('account')
      .leftJoin('account.userProfile', 'userProfile')
      .select([
        'account.id',
        'account.email',
        'account.firstName',
        'account.lastName',
        'account.role',
        'account.hasOnboarded',
        'account.isLocked',
        'account.createdAt',
        'userProfile.totalCheckIns',
        'userProfile.totalFollowers',
        'userProfile.totalFollowing',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(post.post_id)', 'totalPosts')
            .from(PostEntity, 'post')
            .where('post.author_id = account.id')
            .andWhere('post.is_hidden = :isHidden', { isHidden: false }),
        'totalPosts',
      )
      .orderBy('account.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const accounts = await queryBuilder.skip(skip).limit(limit).getRawMany();

    const data: UserStatsDto[] = accounts.map((account) => ({
      userId: account.account_id,
      email: account.account_email,
      firstName: account.account_first_name,
      lastName: account.account_last_name,
      role: account.account_role,
      hasOnboarded: account.account_has_onboarded,
      isLocked: account.account_is_locked,
      totalPosts: parseInt(account.totalPosts || '0', 10),
      totalCheckIns: account.userProfile_total_check_ins || 0,
      totalFollowers: account.userProfile_total_followers || 0,
      totalFollowing: account.userProfile_total_following || 0,
      createdAt: account.account_created_at,
    }));

    return {
      data,
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }

  async getPostStats(
    params: PaginationParams,
  ): Promise<PaginationResult<PostStatsDto>> {
    const { page, limit, skip } = this.normalizePaginationParams(params);

    const queryBuilder = this.postRepository.repo
      .createQueryBuilder('post')
      .leftJoin('post.author', 'author')
      .select([
        'post.postId',
        'post.authorId',
        'post.type',
        'post.totalUpvotes',
        'post.totalDownvotes',
        'post.totalComments',
        'post.isVerified',
        'post.isHidden',
        'post.createdAt',
        'author.firstName',
        'author.lastName',
      ])
      .where('post.isHidden = :isHidden', { isHidden: false })
      .orderBy('post.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const posts = await queryBuilder.skip(skip).limit(limit).getRawMany();

    const data: PostStatsDto[] = posts.map((post) => ({
      postId: post.post_post_id,
      authorId: post.post_author_id,
      authorName:
        `${post.author_first_name || ''} ${post.author_last_name || ''}`.trim(),
      type: post.post_type,
      totalUpvotes: post.post_total_upvotes || 0,
      totalDownvotes: post.post_total_downvotes || 0,
      totalComments: post.post_total_comments || 0,
      isVerified: post.post_is_verified || false,
      isHidden: post.post_is_hidden || false,
      createdAt: post.post_created_at,
    }));

    return {
      data,
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }

  async getLocationStats(
    params: PaginationParams,
  ): Promise<PaginationResult<LocationStatsDto>> {
    const { page, limit, skip } = this.normalizePaginationParams(params);

    const queryBuilder = this.locationRepository.repo
      .createQueryBuilder('location')
      .select([
        'location.id',
        'location.name',
        'location.addressLine',
        'location.isVisibleOnMap',
        'location.createdAt',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(checkIn.check_in_id)', 'totalCheckIns')
            .from(CheckInEntity, 'checkIn')
            .where('checkIn.location_id = location.id'),
        'totalCheckIns',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(post.post_id)', 'totalPosts')
            .from(PostEntity, 'post')
            .where('post.location_id = location.id')
            .andWhere('post.is_hidden = :isHidden', { isHidden: false }),
        'totalPosts',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('AVG(post.rating)', 'averageRating')
            .from(PostEntity, 'post')
            .where('post.location_id = location.id')
            .andWhere('post.rating IS NOT NULL')
            .andWhere('post.is_hidden = :isHidden', { isHidden: false }),
        'averageRating',
      )
      .orderBy('location.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const locations = await queryBuilder.skip(skip).limit(limit).getRawMany();

    const data: LocationStatsDto[] = locations.map((location) => ({
      locationId: location.location_id,
      name: location.location_name,
      addressLine: location.location_address_line,
      totalCheckIns: parseInt(location.totalCheckIns || '0', 10),
      totalPosts: parseInt(location.totalPosts || '0', 10),
      averageRating: location.averageRating
        ? parseFloat(location.averageRating)
        : 0,
      isVisibleOnMap: location.location_is_visible_on_map || false,
      createdAt: location.location_created_at,
    }));

    return {
      data,
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }

  async getEventStats(
    params: PaginationParams,
  ): Promise<PaginationResult<EventStatsDto>> {
    const { page, limit, skip } = this.normalizePaginationParams(params);

    const eventRepo = this.dataSource.getRepository(EventEntity);
    const queryBuilder = eventRepo
      .createQueryBuilder('event')
      .select([
        'event.id',
        'event.displayName',
        'event.status',
        'event.startDate',
        'event.endDate',
        'event.createdAt',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('SUM(ticket.total_quantity)', 'totalTickets')
            .from(EventTicketEntity, 'ticket')
            .where('ticket.event_id = event.id'),
        'totalTickets',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select(
              'SUM(ticket.total_quantity - ticket.total_quantity_available)',
              'soldTickets',
            )
            .from(EventTicketEntity, 'ticket')
            .where('ticket.event_id = event.id'),
        'soldTickets',
      )
      .orderBy('event.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const events = await queryBuilder.skip(skip).limit(limit).getRawMany();

    const data: EventStatsDto[] = events.map((event) => ({
      eventId: event.event_id,
      displayName: event.event_display_name,
      status: event.event_status,
      startDate: event.event_start_date,
      endDate: event.event_end_date,
      totalTickets: parseInt(event.totalTickets || '0', 10),
      soldTickets: parseInt(event.soldTickets || '0', 10),
      createdAt: event.event_created_at,
    }));

    return {
      data,
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }
}

import { CreateReportDto } from '@/common/dto/report/CreateReport.dto';
import { GetEntityReportsDto } from '@/common/dto/report/GetEntityReports.dto';
import { ReportEntity, ReportEntityType } from '../../domain/Report.entity';
import { IReportService } from '../IReport.service';
import { ReportRepository } from '../../infra/repository/Report.repository';
import type { PaginationParams } from '@/common/services/base.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PostEntity } from '@/modules/post/domain/Post.entity';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';

@Injectable()
export class ReportService implements IReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createReport(reportDto: CreateReportDto): Promise<any> {
    await this.validateEntityExists(reportDto.entityType, reportDto.entityId);

    return this.reportRepository.repo.manager.transaction(async (manager) => {
      const report = manager.create(ReportEntity, reportDto);
      return manager.save(report);
    });
  }

  private async validateEntityExists(
    entityType: ReportEntityType,
    entityId: string,
  ): Promise<void> {
    let exists = false;

    switch (entityType) {
      case ReportEntityType.POST:
        exists = await this.dataSource.getRepository(PostEntity).exists({
          where: { postId: entityId },
        });
        break;
      case ReportEntityType.EVENT:
        exists = await this.dataSource.getRepository(EventEntity).exists({
          where: { id: entityId },
        });
        break;
      case ReportEntityType.LOCATION:
        exists = await this.dataSource.getRepository(LocationEntity).exists({
          where: { id: entityId },
        });
        break;
      case ReportEntityType.BUSINESS:
        exists = await this.dataSource.getRepository(BusinessEntity).exists({
          where: { accountId: entityId },
        });
        break;
      case ReportEntityType.REVIEW:
        exists = await this.dataSource.getRepository(PostEntity).exists({
          where: { postId: entityId },
        });
        break;
      default:
        throw new BadRequestException(`Invalid entity type`);
    }

    if (!exists) {
      throw new BadRequestException(
        `${entityType} with id ${entityId} does not exist`,
      );
    }
  }

  async getReports(query: PaginationParams): Promise<any> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [data, total] = await this.reportRepository.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
      relations: ['user'],
      select: {
        reportId: true,
        entityId: true,
        entityType: true,
        title: true,
        reason: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          avatarUrl: true,
          firstName: true,
          lastName: true,
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    // Enrich data with entity information
    const enrichedData = await Promise.all(
      data.map(async (report) => ({
        ...report,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        entity: await this.getEntityInfo(report.entityType, report.entityId),
      })),
    );

    return {
      data: enrichedData,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getEntityReports(query: GetEntityReportsDto): Promise<any> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [data, total] = await this.reportRepository.repo.findAndCount({
      where: {
        entityType: query.entityType,
        entityId: query.entityId,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
      relations: ['user'],
      select: {
        reportId: true,
        entityId: true,
        entityType: true,
        title: true,
        reason: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          avatarUrl: true,
          firstName: true,
          lastName: true,
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    // Enrich data with entity information
    const enrichedData = await Promise.all(
      data.map(async (report) => ({
        ...report,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        entity: await this.getEntityInfo(report.entityType, report.entityId),
      })),
    );

    return {
      data: enrichedData,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getMyReports(userId: string, query: PaginationParams): Promise<any> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [data, total] = await this.reportRepository.repo.findAndCount({
      where: {
        userId,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
      select: {
        reportId: true,
        entityId: true,
        entityType: true,
        title: true,
        reason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    // Enrich data with entity information
    const enrichedData = await Promise.all(
      data.map(async (report) => ({
        ...report,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        entity: await this.getEntityInfo(report.entityType, report.entityId),
      })),
    );

    return {
      data: enrichedData,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async deleteReport(
    reportId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<any> {
    // Find the report
    const report = await this.reportRepository.repo.findOne({
      where: { reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check permission: only admin or the report creator can delete
    if (!isAdmin && report.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this report',
      );
    }

    // Delete the report
    await this.reportRepository.repo.remove(report);

    return {
      success: true,
      message: 'Report deleted successfully',
    };
  }

  private async getEntityInfo(
    entityType: ReportEntityType,
    entityId: string,
  ): Promise<any> {
    try {
      switch (entityType) {
        case ReportEntityType.POST: {
          const post = await this.dataSource.getRepository(PostEntity).findOne({
            where: { postId: entityId },
            relations: ['author'],
            select: {
              postId: true,
              content: true,
              type: true,
              rating: true,
              imageUrls: true,
              createdAt: true,
              authorId: true,
              author: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          });
          return post;
        }

        case ReportEntityType.EVENT: {
          const event = await this.dataSource
            .getRepository(EventEntity)
            .findOne({
              where: { id: entityId },
              relations: ['createdBy'],
              select: {
                id: true,
                displayName: true,
                description: true,
                startDate: true,
                endDate: true,
                avatarUrl: true,
                coverUrl: true,
                createdAt: true,
                createdById: true,
                createdBy: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  email: true,
                },
              },
            });
          return event;
        }

        case ReportEntityType.LOCATION: {
          const location = await this.dataSource
            .getRepository(LocationEntity)
            .findOne({
              where: { id: entityId },
              relations: ['business', 'business.account'],
              select: {
                id: true,
                name: true,
                description: true,
                addressLine: true,
                addressLevel1: true,
                addressLevel2: true,
                latitude: true,
                longitude: true,
                imageUrl: true,
                createdAt: true,
                businessId: true,
                business: {
                  accountId: true,
                  name: true,
                  email: true,
                  phone: true,
                  account: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    email: true,
                  },
                },
              },
            });
          return location;
        }

        case ReportEntityType.BUSINESS: {
          const business = await this.dataSource
            .getRepository(BusinessEntity)
            .findOne({
              where: { accountId: entityId },
              relations: ['account'],
              select: {
                accountId: true,
                name: true,
                description: true,
                avatar: true,
                website: true,
                email: true,
                phone: true,
                address: true,
                category: true,
                status: true,
                createdAt: true,
                account: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  email: true,
                },
              },
            });
          return business;
        }

        case ReportEntityType.REVIEW: {
          const review = await this.dataSource
            .getRepository(PostEntity)
            .findOne({
              where: { postId: entityId },
              select: {
                postId: true,
                content: true,
                type: true,
                rating: true,
                imageUrls: true,
                authorId: true,
                locationId: true,
                eventId: true,
                createdAt: true,
                updatedAt: true,
                author: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  email: true,
                },
              },
            });

          // Manually fetch author info for review
          if (review) {
            const author = await this.dataSource
              .getRepository(AccountEntity)
              .findOne({
                where: { id: review.authorId },
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  email: true,
                },
              });
            return { ...review, author };
          }
          return review;
        }

        default:
          return null;
      }
    } catch (error) {
      // If entity was deleted after report was created, return null
      return null;
    }
  }
}

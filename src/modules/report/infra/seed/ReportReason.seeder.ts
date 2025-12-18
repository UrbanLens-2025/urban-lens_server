import { CoreService } from '@/common/core/Core.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import { In } from 'typeorm';
import { ReportReasonRepositoryProvider } from '@/modules/report/infra/repository/ReportReason.repository';
import { ReportReasonEntity } from '@/modules/report/domain/ReportReason.entity';

@Injectable()
export class ReportReasonSeeder extends CoreService implements OnModuleInit {
  private readonly logger = new Logger(ReportReasonSeeder.name);

  private readonly DEFAULT_REASONS: Partial<ReportReasonEntity>[] = [
    // POST REASONS
    {
      key: 'spam',
      displayName: 'Spam or repetitive content',
      description:
        'Contains spam or repetitive content that violates the community guidelines.',
      isActive: true,
      forPost: true,
      priority: 30,
    },
    {
      key: 'inappropriate_content',
      displayName: 'Inappropriate content',
      description:
        'Contains inappropriate content that is not suitable for the community or violates the community guidelines.',
      isActive: true,
      forPost: true,
      forEvent: true,
      forLocation: true,
      priority: 80,
    },
    {
      key: 'harassment',
      displayName: 'Harassment or hate',
      description:
        'Covers abusive language, personal attacks, discrimination, or targeted harassment.',
      isActive: true,
      forPost: true,
      forEvent: true,
      forLocation: true,
      priority: 90,
    },
    {
      key: 'misinformation',
      displayName: 'Misinformation',
      description: 'Contains misinformation that is not true or misleading.',
      isActive: true,
      forPost: true,
      forEvent: true,
      forLocation: true,
      priority: 80,
    },
    // EVENT REASONS
    {
      key: 'incorrect_info',
      displayName: 'Incorrect information',
      description:
        'Event has wrong date, time, venue, or other critical details.',
      isActive: true,
      forEvent: true,
      forLocation: true,
      priority: 40,
    },
    {
      key: 'fraudulent_scam',
      displayName: 'Fraudulent or scam event',
      description: 'Fake content that is designed to deceive or scam users.',
      isActive: true,
      forEvent: true,
      forLocation: true,
      priority: 100, // Highest - money/safety involved
    },
    {
      key: 'closed_invalid',
      displayName: "Cancelled or doesn't exist",
      description: 'Event has been cancelled or never existed.',
      isActive: true,
      forEvent: true,
      forLocation: true,
      priority: 100,
    },
    // LOCATION REASONS
    {
      key: 'unresponsive_bookings',
      displayName: 'Unresponsive to bookings',
      description: "Business doesn't respond to booking requests or inquiries.",
      isActive: true,
      forLocation: true,
      priority: 60,
    },
    // UNIVERSAL
    {
      key: 'other',
      displayName: 'Other',
      description:
        'Other reason not covered by the above options. Please provide details.',
      isActive: true,
      forPost: true,
      forEvent: true,
      forLocation: true,
      priority: 10, // Lowest priority
    },
  ];

  constructor(private readonly configService: ConfigService<Environment>) {
    super();
  }

  async onModuleInit(): Promise<void> {
    if (!this.configService.get('ENABLE_REPORT_REASON_SEEDING')) {
      this.logger.debug('Report reason seeding disabled. Skipping.');
      return;
    }

    await this.seedReportReasons();
  }

  private async seedReportReasons(): Promise<void> {
    await this.ensureTransaction(null, async (em) => {
      const repository = ReportReasonRepositoryProvider(em);

      const existing = await repository.find({
        where: { key: In(this.DEFAULT_REASONS.map((reason) => reason.key)) },
        select: { key: true },
      });
      const existingKeys = new Set(existing.map((reason) => reason.key));

      const reasonsToCreate = this.DEFAULT_REASONS.filter(
        (reason) => !existingKeys.has(reason.key!),
      );

      if (!reasonsToCreate.length) {
        this.logger.debug(
          'All default report reasons already exist. Skipping.',
        );
        return;
      }

      await repository.save(
        reasonsToCreate.map((reason) => ({
          key: reason.key,
          displayName: reason.displayName,
          description: reason.description,
          isActive: reason.isActive,
          forEvent: reason.forEvent,
          forLocation: reason.forLocation,
          forPost: reason.forPost,
        })),
      );

      this.logger.debug(
        `Created ${reasonsToCreate.length} report reason(s): ${reasonsToCreate
          .map((reason) => reason.key)
          .join(', ')}`,
      );
    });
  }
}

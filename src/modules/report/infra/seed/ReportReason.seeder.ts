import { CoreService } from '@/common/core/Core.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import { In } from 'typeorm';
import { ReportReasonRepositoryProvider } from '@/modules/report/infra/repository/ReportReason.repository';

interface SeedReportReason {
  key: string;
  displayName: string;
  description: string;
  isActive: boolean;
}

@Injectable()
export class ReportReasonSeeder extends CoreService implements OnModuleInit {
  private readonly logger = new Logger(ReportReasonSeeder.name);

  private readonly DEFAULT_REASONS: SeedReportReason[] = [
    {
      key: 'spam_content',
      displayName: 'Spam or repetitive content',
      description:
        'Use this when the report target repeatedly posts identical or promotional content across posts, comments, events, or businesses.',
      isActive: true,
    },
    {
      key: 'misinformation',
      displayName: 'False or misleading information',
      description:
        'Flag locations, posts, or events that intentionally provide incorrect business details, pricing, or availability.',
      isActive: true,
    },
    {
      key: 'harassment',
      displayName: 'Harassment or hate',
      description:
        'Covers abusive language, personal attacks, discrimination, or targeted harassment inside comments or posts.',
      isActive: true,
    },
    {
      key: 'inappropriate_media',
      displayName: 'Inappropriate media',
      description:
        'Report images or videos that contain nudity, graphic violence, or otherwise violate community guidelines.',
      isActive: true,
    },
    {
      key: 'fraudulent_business',
      displayName: 'Fraudulent business or location',
      description:
        'Businesses or locations that accept payments without providing services, or that impersonate another brand.',
      isActive: true,
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
        (reason) => !existingKeys.has(reason.key),
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

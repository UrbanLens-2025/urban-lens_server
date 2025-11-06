import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

interface TagScore {
  id: number;
  name: string;
  groupName: string;
  totalScore: number;
}

@Injectable()
export class ReviewWorkerService {
  private readonly logger = new Logger(ReviewWorkerService.name);
  private readonly schema: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.schema = this.configService.get<string>('DATABASE_SCHEMA') || 'public';
  }

  /**
   * Update user's tag scores based on review ratings
   * Rating 1-2: negative weight (-2, -1)
   * Rating 3: neutral (0)
   * Rating 4-5: positive weight (+1, +2)
   */
  async batchUpdateTagScoresFromReviews(
    userId: string,
    tagScores: TagScore[],
  ): Promise<void> {
    if (tagScores.length === 0) {
      this.logger.debug(`No tags to update for user ${userId}`);
      return;
    }

    try {
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      for (const tag of tagScores) {
        if (tag.totalScore === 0) {
          // Skip neutral scores (rating = 3)
          continue;
        }

        const tagKey = `tag_${tag.id}`;
        updates.push(
          `$${paramIndex}::text, COALESCE((tag_scores->>$${paramIndex + 1}::text)::int, 0) + $${paramIndex + 2}::int`,
        );
        params.push(tagKey, tagKey, tag.totalScore);
        paramIndex += 3;
      }

      if (updates.length === 0) {
        this.logger.debug(
          `All reviews were neutral (rating 3) for user ${userId}`,
        );
        return;
      }

      params.push(userId);

      const query = `
        UPDATE "${this.schema}"."user_profiles"
        SET tag_scores = COALESCE(tag_scores, '{}'::jsonb) || jsonb_build_object(
          ${updates.join(', ')}
        )
        WHERE account_id = $${paramIndex}
      `;

      await this.dataSource.query(query, params);

      const positiveTags = tagScores.filter((t) => t.totalScore > 0);
      const negativeTags = tagScores.filter((t) => t.totalScore < 0);

      this.logger.log(
        `✅ Updated tag scores for user ${userId}: ${positiveTags.length} positive tags, ${negativeTags.length} negative tags`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to batch update tag scores for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUserTagScores(
    userId: string,
  ): Promise<Array<{ tagId: string; score: number }>> {
    const result = await this.dataSource.query(
      `
      SELECT
        key as tag_id,
        (value::text)::int as score
      FROM "${this.schema}"."user_profiles",
           jsonb_each(tag_scores)
      WHERE account_id = $1
      ORDER BY (value::text)::int DESC
      `,
      [userId],
    );

    return result.map((row) => ({
      tagId: row.tag_id,
      score: row.score,
    }));
  }
}

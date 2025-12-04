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
   * 
   * PostgreSQL has a limit of 100 parameters per query.
   * Each tag requires 3 parameters, so we can process max 33 tags per query.
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
      // Filter out neutral scores first
      const nonNeutralTags = tagScores.filter((tag) => tag.totalScore !== 0);

      if (nonNeutralTags.length === 0) {
        this.logger.debug(
          `All reviews were neutral (rating 3) for user ${userId}`,
        );
        return;
      }

      // PostgreSQL limit: 100 parameters max
      // Each tag needs 3 parameters (tagKey, tagKey, totalScore) + 1 for userId
      // So max 33 tags per query: (33 * 3) + 1 = 100
      const MAX_TAGS_PER_QUERY = 33;
      const chunks: TagScore[][] = [];

      for (let i = 0; i < nonNeutralTags.length; i += MAX_TAGS_PER_QUERY) {
        chunks.push(nonNeutralTags.slice(i, i + MAX_TAGS_PER_QUERY));
      }

      // Process each chunk separately
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const updates: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        for (const tag of chunk) {
          const tagKey = `tag_${tag.id}`;
          updates.push(
            `$${paramIndex}::text, COALESCE((tag_scores->>$${paramIndex + 1}::text)::int, 0) + $${paramIndex + 2}::int`,
          );
          params.push(tagKey, tagKey, tag.totalScore);
          paramIndex += 3;
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

        this.logger.debug(
          `Processed chunk ${chunkIndex + 1}/${chunks.length} for user ${userId}: ${chunk.length} tags`,
        );
      }

      const positiveTags = tagScores.filter((t) => t.totalScore > 0);
      const negativeTags = tagScores.filter((t) => t.totalScore < 0);

      this.logger.log(
        `✅ Updated tag scores for user ${userId}: ${positiveTags.length} positive tags, ${negativeTags.length} negative tags (processed in ${chunks.length} chunk(s))`,
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

  /**
   * Update location analytics after receiving reviews
   * Updates total_reviews and average_rating for each location
   */
  async updateLocationAnalytics(
    locationReviews: Map<string, number[]>,
  ): Promise<void> {
    if (locationReviews.size === 0) {
      this.logger.debug('No location analytics to update');
      return;
    }

    try {
      for (const [locationId, ratings] of locationReviews.entries()) {
        // Calculate new average rating from all reviews for this location
        const [result] = await this.dataSource.query(
          `
          SELECT 
            COUNT(*) as total_reviews,
            AVG(rating) as average_rating
          FROM "${this.schema}"."posts"
          WHERE location_id = $1 
            AND type = 'REVIEW'
            AND rating IS NOT NULL
          `,
          [locationId],
        );

        const totalReviews = parseInt(result.total_reviews, 10);
        const averageRating = result.average_rating
          ? parseFloat(result.average_rating)
          : 0;

        // Update location directly
        await this.dataSource.query(
          `
          UPDATE "${this.schema}"."locations"
          SET 
            total_reviews = $2,
            average_rating = $3,
            updated_at = NOW()
          WHERE id = $1
          `,
          [locationId, totalReviews, averageRating],
        );

        this.logger.log(
          `📊 Updated location analytics for ${locationId}: ${totalReviews} reviews, avg rating: ${averageRating.toFixed(2)}`,
        );
      }

      this.logger.log(
        `✅ Updated analytics for ${locationReviews.size} locations`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update location analytics: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

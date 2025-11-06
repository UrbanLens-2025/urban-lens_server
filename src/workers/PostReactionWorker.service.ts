import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

interface TagScore {
  id: number;
  name: string;
  groupName: string;
  count: number;
}

@Injectable()
export class PostReactionWorkerService {
  private readonly logger = new Logger(PostReactionWorkerService.name);
  private readonly schema: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.schema = this.configService.get<string>('DATABASE_SCHEMA') || 'public';
  }

  async batchUpdateTagScoresFromReactions(
    userId: string,
    upvoteTags: TagScore[],
    downvoteTags: TagScore[],
  ): Promise<void> {
    if (upvoteTags.length === 0 && downvoteTags.length === 0) {
      this.logger.debug(`No tags to update for user ${userId}`);
      return;
    }

    try {
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      // Process upvote tags (positive weight: +2 per upvote)
      for (const tag of upvoteTags) {
        const tagKey = `tag_${tag.id}`;
        const increment = tag.count * 2; // +2 points per upvote
        updates.push(
          `$${paramIndex}::text, COALESCE((tag_scores->>$${paramIndex + 1}::text)::int, 0) + $${paramIndex + 2}::int`,
        );
        params.push(tagKey, tagKey, increment);
        paramIndex += 3;
      }

      // Process downvote tags (negative weight: -1 per downvote)
      for (const tag of downvoteTags) {
        const tagKey = `tag_${tag.id}`;
        const decrement = tag.count * -1; // -1 point per downvote
        updates.push(
          `$${paramIndex}::text, COALESCE((tag_scores->>$${paramIndex + 1}::text)::int, 0) + $${paramIndex + 2}::int`,
        );
        params.push(tagKey, tagKey, decrement);
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

      this.logger.log(
        `✅ Updated tag scores for user ${userId}: ${upvoteTags.length} upvoted tags (+2 each), ${downvoteTags.length} downvoted tags (-1 each)`,
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

  async getUserTagScoresRaw(
    userId: string,
  ): Promise<Record<string, number> | null> {
    const result = await this.dataSource.query(
      `
      SELECT tag_scores
      FROM "${this.schema}"."user_profiles"
      WHERE account_id = $1
      `,
      [userId],
    );

    if (result.length === 0 || !result[0].tag_scores) {
      return null;
    }

    return result[0].tag_scores;
  }

  async resetTagScores(userId: string): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE "${this.schema}"."user_profiles"
      SET tag_scores = '{}'::jsonb
      WHERE account_id = $1
      `,
      [userId],
    );

    this.logger.log(`Reset tag scores for user ${userId}`);
  }
}

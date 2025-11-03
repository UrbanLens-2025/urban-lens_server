import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface TagScore {
  id: number;
  name: string;
  groupName: string;
  count: number;
}

@Injectable()
export class TagScoreWorkerService {
  private readonly logger = new Logger(TagScoreWorkerService.name);
  private readonly schema: string;

  constructor(private readonly dataSource: DataSource) {
    // Get schema from connection options or default to 'public'
    this.schema = (this.dataSource.options as any).schema || 'development';
    this.logger.log(`Using database schema: ${this.schema}`);
  }

  /**
   * Batch update user tag scores based on check-in behavior
   * @param userId - User profile ID
   * @param tags - Array of tags with their counts from batched check-ins
   */
  async batchUpdateTagScores(userId: string, tags: TagScore[]): Promise<void> {
    try {
      // Use raw query to avoid entity relation issues
      // Build JSONB update for each tag
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      tags.forEach((tag) => {
        const tagKey = `tag_${tag.id}`;
        const scoreIncrement = tag.count * 5; // 5 points per check-in

        // JSONB update: increment existing score or set to new value
        updates.push(
          `'${tagKey}', COALESCE((tag_scores->>'${tagKey}')::int, 0) + $${paramIndex}`,
        );
        params.push(scoreIncrement);
        paramIndex++;

        this.logger.debug(
          `Tag ${tag.name} (ID: ${tag.id}): +${scoreIncrement} points (${tag.count} check-ins)`,
        );
      });

      if (updates.length === 0) {
        this.logger.warn(`No tags to update for user ${userId}`);
        return;
      }

      // Add userId as last parameter
      params.push(userId);

      // Execute raw SQL to update tag scores
      // Note: JSONB objects don't maintain key order, sorting happens on read
      const query = `
        UPDATE "${this.schema}"."user_profiles"
        SET tag_scores = COALESCE(tag_scores, '{}'::jsonb) || jsonb_build_object(
          ${updates.join(', ')}
        )
        WHERE account_id = $${paramIndex}
      `;

      await this.dataSource.query(query, params);

      this.logger.log(
        `✅ Updated tag scores for user ${userId}: ${tags.length} tags processed`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update tag scores for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw to trigger NACK in controller
    }
  }

  /**
   * Get user's tag scores (sorted by score descending)
   * @param userId - User profile ID
   * @returns Array of tag scores sorted by value
   */
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
   * Get user's tag scores as object (unsorted)
   * @param userId - User profile ID
   * @returns Tag scores object
   */
  async getUserTagScoresRaw(userId: string): Promise<Record<string, number>> {
    const result = await this.dataSource.query(
      `SELECT tag_scores FROM "${this.schema}"."user_profiles" WHERE account_id = $1`,
      [userId],
    );

    return result[0]?.tag_scores || {};
  }

  /**
   * Reset user's tag scores (for testing/admin purposes)
   * @param userId - User profile ID
   */
  async resetTagScores(userId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE "${this.schema}"."user_profiles" SET tag_scores = $1 WHERE account_id = $2`,
      ['{}', userId],
    );

    this.logger.log(`Reset tag scores for user ${userId}`);
  }
}

import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { ReviewWorkerService } from './ReviewWorker.service';

interface ReviewMessage {
  userId: string;
  postId: string;
  locationId: string;
  rating: number; // 1-5 stars
  tags: Array<{ id: number; name: string; groupName: string }>;
  timestamp: string;
}

@Controller()
export class ReviewWorkerController {
  private readonly logger = new Logger(ReviewWorkerController.name);

  constructor(private readonly reviewService: ReviewWorkerService) {}

  // Batch storage: userId -> array of messages
  private readonly userBatches = new Map<string, ReviewMessage[]>();

  // Batch processing timers: userId -> timer
  private readonly batchTimers = new Map<string, NodeJS.Timeout>();

  // Batch configuration
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT_MS = 5000;

  @EventPattern('user.review.created')
  async handleReviewCreated(
    @Payload() data: ReviewMessage,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    try {
      const userId = data.userId;

      this.logger.log(
        `📨 Received review: User ${userId} rated location ${data.locationId} with ${data.rating} stars`,
      );

      // Add message to user's batch
      if (!this.userBatches.has(userId)) {
        this.userBatches.set(userId, []);
      }
      this.userBatches.get(userId)!.push(data);

      // Clear existing timer for this user
      if (this.batchTimers.has(userId)) {
        clearTimeout(this.batchTimers.get(userId)!);
      }

      const currentBatchSize = this.userBatches.get(userId)!.length;

      // Process immediately if batch size reached
      if (currentBatchSize >= this.BATCH_SIZE) {
        await this.processBatch(userId);
      } else {
        // Set timer to process batch after timeout
        const timer = setTimeout(() => {
          this.processBatch(userId).catch((err) =>
            this.logger.error(`Batch processing error: ${err.message}`),
          );
        }, this.BATCH_TIMEOUT_MS);

        this.batchTimers.set(userId, timer);

        this.logger.log(
          `📦 Batching: ${currentBatchSize}/${this.BATCH_SIZE} reviews for user ${userId}`,
        );
      }

      // Acknowledge message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `❌ Error handling message: ${error.message}`,
        error.stack,
      );

      // Reject and requeue the message for retry
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
    }
  }

  private async processBatch(userId: string): Promise<void> {
    const batch = this.userBatches.get(userId);
    if (!batch || batch.length === 0) return;

    this.logger.log('='.repeat(60));
    this.logger.log(`🔄 Processing review batch for user ${userId}`);
    this.logger.log(`Batch size: ${batch.length} reviews`);
    this.logger.log('='.repeat(60));

    // Aggregate tags weighted by rating
    const tagScoresMap = new Map<
      number,
      { id: number; name: string; groupName: string; totalScore: number }
    >();

    batch.forEach((message, idx) => {
      this.logger.log(
        `  Review ${idx + 1}: Location ${message.locationId}, ${message.rating} stars (${message.tags.length} tags)`,
      );

      // Calculate weight based on rating
      // Rating 1-2: negative (-2, -1)
      // Rating 3: neutral (0)
      // Rating 4-5: positive (+1, +2)
      const weight = message.rating - 3;

      message.tags.forEach((tag) => {
        if (!tagScoresMap.has(tag.id)) {
          tagScoresMap.set(tag.id, { ...tag, totalScore: 0 });
        }
        tagScoresMap.get(tag.id)!.totalScore += weight;
      });
    });

    this.logger.log(`\n📊 Aggregated tag scores for user ${userId}:`);
    tagScoresMap.forEach((tag) => {
      const emoji =
        tag.totalScore > 0 ? '📈' : tag.totalScore < 0 ? '📉' : '➖';
      this.logger.log(
        `  ${emoji} [ID: ${tag.id}] ${tag.name} (${tag.groupName}) - Score: ${tag.totalScore > 0 ? '+' : ''}${tag.totalScore}`,
      );
    });

    // Batch update user tag scores in database
    await this.reviewService.batchUpdateTagScoresFromReviews(
      userId,
      Array.from(tagScoresMap.values()),
    );

    this.logger.log('='.repeat(60));
    this.logger.log(`✅ Review batch processed for user ${userId}\n`);

    // Clear batch and timer
    this.userBatches.delete(userId);
    if (this.batchTimers.has(userId)) {
      clearTimeout(this.batchTimers.get(userId)!);
      this.batchTimers.delete(userId);
    }
  }
}

import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { TagScoreWorkerService } from './TagScoreWorker.service';

interface CheckInTagMessage {
  userId: string;
  locationId: string;
  locationName: string;
  tags: Array<{ id: number; name: string; groupName: string }>;
  timestamp: string;
}

@Controller()
export class TagScoreWorkerController {
  private readonly logger = new Logger(TagScoreWorkerController.name);

  constructor(private readonly tagScoreService: TagScoreWorkerService) {}

  // Batch storage: userId -> array of messages
  private readonly userBatches = new Map<string, CheckInTagMessage[]>();

  // Batch processing timers: userId -> timer
  private readonly batchTimers = new Map<string, NodeJS.Timeout>();

  // Batch configuration
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT_MS = 5000;

  @EventPattern('user.checkin.tags')
  async handleCheckInTags(
    @Payload() data: CheckInTagMessage,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    try {
      const userId = data.userId;

      this.logger.log(
        `📨 Received message for user ${userId} at ${data.locationName}`,
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
          `📦 Batching: ${currentBatchSize}/${this.BATCH_SIZE} messages for user ${userId}`,
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
    this.logger.log(`🔄 Processing batch for user ${userId}`);
    this.logger.log(`Batch size: ${batch.length} messages`);
    this.logger.log('='.repeat(60));

    // Aggregate all tags from batch
    const allTagsMap = new Map<
      number,
      { id: number; name: string; groupName: string; count: number }
    >();

    batch.forEach((message, idx) => {
      this.logger.log(
        `  Message ${idx + 1}: ${message.locationName} (${message.tags.length} tags)`,
      );

      message.tags.forEach((tag) => {
        if (!allTagsMap.has(tag.id)) {
          allTagsMap.set(tag.id, { ...tag, count: 0 });
        }
        allTagsMap.get(tag.id)!.count++;
      });
    });

    this.logger.log(`\n📊 Aggregated tags for user ${userId}:`);
    allTagsMap.forEach((tag) => {
      this.logger.log(
        `  [ID: ${tag.id}] ${tag.name} (${tag.groupName}) - Count: ${tag.count}`,
      );
    });

    // Batch update user tag scores in database
    await this.tagScoreService.batchUpdateTagScores(
      userId,
      Array.from(allTagsMap.values()),
    );

    this.logger.log('='.repeat(60));
    this.logger.log(`✅ Batch processed for user ${userId}\n`);

    // Clear batch and timer
    this.userBatches.delete(userId);
    if (this.batchTimers.has(userId)) {
      clearTimeout(this.batchTimers.get(userId)!);
      this.batchTimers.delete(userId);
    }
  }
}

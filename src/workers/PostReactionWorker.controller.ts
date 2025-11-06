import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { PostReactionWorkerService } from './PostReactionWorker.service';

interface PostReactionMessage {
  reactorUserId: string;
  postId: string;
  postAuthorId: string;
  reactType: 'upvote' | 'downvote';
  locationId?: string;
  tags: Array<{ id: number; name: string; groupName: string }>;
  timestamp: string;
}

@Controller()
export class PostReactionWorkerController {
  private readonly logger = new Logger(PostReactionWorkerController.name);

  constructor(
    private readonly postReactionService: PostReactionWorkerService,
  ) {}

  // Batch storage: userId -> array of messages
  private readonly userBatches = new Map<string, PostReactionMessage[]>();

  // Batch processing timers: userId -> timer
  private readonly batchTimers = new Map<string, NodeJS.Timeout>();

  // Batch configuration
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT_MS = 5000;

  @EventPattern('user.post.reaction')
  async handlePostReaction(
    @Payload() data: PostReactionMessage,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    try {
      const userId = data.reactorUserId;

      this.logger.log(
        `📨 Received post reaction: User ${userId} ${data.reactType}d post ${data.postId}`,
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
          `📦 Batching: ${currentBatchSize}/${this.BATCH_SIZE} reactions for user ${userId}`,
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
    this.logger.log(`🔄 Processing reaction batch for user ${userId}`);
    this.logger.log(`Batch size: ${batch.length} reactions`);
    this.logger.log('='.repeat(60));

    // Aggregate tags by reaction type
    const upvoteTagsMap = new Map<
      number,
      { id: number; name: string; groupName: string; count: number }
    >();
    const downvoteTagsMap = new Map<
      number,
      { id: number; name: string; groupName: string; count: number }
    >();

    batch.forEach((message, idx) => {
      this.logger.log(
        `  Reaction ${idx + 1}: ${message.reactType} on post ${message.postId} (${message.tags.length} tags)`,
      );

      const targetMap =
        message.reactType === 'upvote' ? upvoteTagsMap : downvoteTagsMap;

      message.tags.forEach((tag) => {
        if (!targetMap.has(tag.id)) {
          targetMap.set(tag.id, { ...tag, count: 0 });
        }
        targetMap.get(tag.id)!.count++;
      });
    });

    this.logger.log(`\n📊 Aggregated tags for user ${userId}:`);
    this.logger.log(`  Upvotes: ${upvoteTagsMap.size} unique tags`);
    upvoteTagsMap.forEach((tag) => {
      this.logger.log(
        `    [ID: ${tag.id}] ${tag.name} (${tag.groupName}) - Count: ${tag.count}`,
      );
    });
    this.logger.log(`  Downvotes: ${downvoteTagsMap.size} unique tags`);
    downvoteTagsMap.forEach((tag) => {
      this.logger.log(
        `    [ID: ${tag.id}] ${tag.name} (${tag.groupName}) - Count: ${tag.count}`,
      );
    });

    // Batch update user tag scores in database
    await this.postReactionService.batchUpdateTagScoresFromReactions(
      userId,
      Array.from(upvoteTagsMap.values()),
      Array.from(downvoteTagsMap.values()),
    );

    this.logger.log('='.repeat(60));
    this.logger.log(`✅ Reaction batch processed for user ${userId}\n`);

    // Clear batch and timer
    this.userBatches.delete(userId);
    if (this.batchTimers.has(userId)) {
      clearTimeout(this.batchTimers.get(userId)!);
      this.batchTimers.delete(userId);
    }
  }
}

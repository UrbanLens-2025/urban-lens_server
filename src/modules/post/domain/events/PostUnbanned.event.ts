export class PostUnbannedEvent {
  postId: string;
  authorId: string;
  reason?: string;
}

export const POST_UNBANNED_EVENT = 'post.unbanned';


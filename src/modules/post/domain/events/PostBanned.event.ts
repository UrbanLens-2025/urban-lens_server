export class PostBannedEvent {
  postId: string;
  authorId: string;
  reason?: string;
}

export const POST_BANNED_EVENT = 'post.banned';

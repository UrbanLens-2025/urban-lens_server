export class CommentCreatedEvent {
  constructor(
    public readonly commentId: string,
    public readonly authorId: string,
    public readonly postId: string,
  ) {
    this.commentId = commentId;
    this.authorId = authorId;
    this.postId = postId;
  }
}

export const COMMENT_CREATED_EVENT = 'comment.created';

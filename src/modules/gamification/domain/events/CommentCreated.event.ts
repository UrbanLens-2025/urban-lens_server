export class CommentCreatedEvent {
  commentId: string;
  authorId: string;
  postId: string;
}

export const COMMENT_CREATED_EVENT = 'comment.created';

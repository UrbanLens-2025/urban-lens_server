export class PostCommentedEvent {
  constructor(
    public readonly userId: string,
    public readonly postId: string,
    public readonly commentId: string,
    public readonly locationId: string,
    public readonly postAuthorId: string,
  ) {}
}

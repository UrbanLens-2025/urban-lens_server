export class PostLikedEvent {
  constructor(
    public readonly userId: string,
    public readonly postId: string,
    public readonly locationId: string,
    public readonly postAuthorId: string,
  ) {}
}

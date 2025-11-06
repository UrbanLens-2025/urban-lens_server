import { ReactType } from '../React.entity';

export const POST_REACTED_EVENT = 'post.reacted';

export class PostReactedEvent {
  postId: string;
  postAuthorId: string;
  reactorUserId: string; // user who reacted
  reactType: ReactType; // upvote or downvote
  locationId?: string; // location associated with the post
}

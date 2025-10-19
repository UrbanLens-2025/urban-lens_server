import { ReactType } from '@/modules/post/domain/React.entity';

export class PostReactedEvent {
  postId: string;
  userId: string;
  reactType: ReactType;
}

export const POST_REACTED_EVENT = 'post.reacted';

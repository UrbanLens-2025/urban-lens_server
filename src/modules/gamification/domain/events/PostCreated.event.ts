import { PostType } from '@/modules/post/domain/Post.entity';

export class PostCreatedEvent {
  postId: string;
  authorId: string;
  postType: PostType;
  isVerified?: boolean;
}

export const POST_CREATED_EVENT = 'post.created';

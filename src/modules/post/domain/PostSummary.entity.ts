// PostSummary.entity.ts
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { PostEntity } from '@/modules/post/domain/Post.entity';

@Entity({ name: 'post_summary' })
export class PostSummaryEntity {
  @PrimaryColumn({ name: 'post_id', type: 'uuid' }) // dùng luôn post_id làm PK
  postId: string;

  @OneToOne(() => PostEntity, (post) => post.postId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @Column({ name: 'total_comments', type: 'integer', default: 0 })
  totalComments: number;

  @Column({ name: 'total_likes', type: 'integer', default: 0 })
  totalLikes: number;

  @Column({ name: 'total_dislikes', type: 'integer', default: 0 })
  totalDislikes: number;
}

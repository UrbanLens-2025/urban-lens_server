import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../domain/Post.entity';
import { CommentEntity } from '../domain/Comment.entity';
import { Module } from '@nestjs/common';
import { PostRepository } from './repository/Post.repository';
import { PostSummaryRepository } from '@/modules/post/infra/repository/PostSummary.repository';
import { PostSummaryEntity } from '@/modules/post/domain/PostSummary.entity';

const repositories = [PostRepository, PostSummaryRepository];

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, CommentEntity, PostSummaryEntity]),
  ],
  providers: repositories,
  exports: repositories,
})
export class PostInfraModule {}

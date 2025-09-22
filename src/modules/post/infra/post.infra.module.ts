import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../domain/Post.entity';
import { CommentEntity } from '../domain/Comment.entity';
import { Module } from '@nestjs/common';
import {
  PostRepository,
  PostSummaryRepository,
} from './repository/Post.repository';

const repositories = [PostRepository, PostSummaryRepository];

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, CommentEntity])],
  providers: repositories,
  exports: repositories,
})
export class PostInfraModule {}

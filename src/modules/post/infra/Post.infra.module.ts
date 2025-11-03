import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../domain/Post.entity';
import { CommentEntity } from '../domain/Comment.entity';
import { ReactEntity } from '../domain/React.entity';
import { Module } from '@nestjs/common';
import { PostRepository } from './repository/Post.repository';
import { CommentRepository } from './repository/Comment.repository';
import { ReactRepository } from './repository/React.repository';
import { AnnouncementEntity } from '@/modules/post/domain/Announcement.entity';

const repositories = [PostRepository, CommentRepository, ReactRepository];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      CommentEntity,
      ReactEntity,
      AnnouncementEntity,
    ]),
  ],
  providers: repositories,
  exports: repositories,
})
export class PostInfraModule {}

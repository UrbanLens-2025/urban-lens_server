import { Module } from '@nestjs/common';
import { PostController } from '@/modules/post/interfaces/Post.controller';
import { IPostService } from '@/modules/post/app/IPost.service';
import { PostService } from '@/modules/post/app/impl/Post.service';
import { PostInfraModule } from './infra/Post.infra.module';
import { AnalyticInfraModule } from '../analytic/infra/Analytic.infra.module';
import { CommentController } from './interfaces/Comment.controller';
import { ICommentService } from './app/IComment.service';
import { CommentService } from './app/impl/Comment.service';

@Module({
  imports: [PostInfraModule, AnalyticInfraModule],
  controllers: [PostController, CommentController],
  providers: [
    {
      provide: IPostService,
      useClass: PostService,
    },
    {
      provide: ICommentService,
      useClass: CommentService,
    },
  ],
})
export class PostModule {}

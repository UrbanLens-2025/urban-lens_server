import { Module } from '@nestjs/common';
import { PostController } from '@/modules/post/interfaces/Post.controller';
import { IPostService } from '@/modules/post/app/IPost.service';
import { PostService } from '@/modules/post/app/impl/Post.service';
import { PostInfraModule } from '@/modules/post/infra/Post.infra.module';
import { AnalyticInfraModule } from '@/modules/analytic/infra/Analytic.infra.module';
import { CommentController } from '@/modules/post/interfaces/Comment.controller';
import { ICommentService } from '@/modules/post/app/IComment.service';
import { CommentService } from '@/modules/post/app/impl/Comment.service';

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

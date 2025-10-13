import { Module } from '@nestjs/common';
import { PostPublicController } from '@/modules/post/interfaces/Post.public.controller';
import { IPostService } from '@/modules/post/app/IPost.service';
import { PostService } from '@/modules/post/app/impl/Post.service';
import { AnalyticInfraModule } from '@/modules/analytic/infra/Analytic.infra.module';
import { CommentController } from '@/modules/post/interfaces/Comment.controller';
import { ICommentService } from '@/modules/post/app/IComment.service';
import { CommentService } from '@/modules/post/app/impl/Comment.service';
import { PostInfraModule } from '@/modules/post/infra/Post.infra.module';
import { FileStorageModule } from '@/modules/file-storage/FileStorage.module';
import { PostUserController } from './interfaces/Post.user.controller';

@Module({
  imports: [PostInfraModule, AnalyticInfraModule, FileStorageModule],
  controllers: [PostPublicController, CommentController, PostUserController],
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

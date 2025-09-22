import { Module } from '@nestjs/common';
import { PostInfraModule } from '@/modules/post/infra/post.infra.module';
import { PostController } from '@/modules/post/interfaces/Post.controller';
import { IPostService } from '@/modules/post/app/IPost.service';
import { PostService } from '@/modules/post/app/impl/Post.service';

@Module({
  imports: [PostInfraModule],
  controllers: [PostController],
  providers: [
    {
      provide: IPostService,
      useClass: PostService,
    },
  ],
})
export class PostModule {}

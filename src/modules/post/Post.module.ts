import { Module } from '@nestjs/common';
import { PostPublicController } from '@/modules/post/interfaces/Post.public.controller';
import { IPostService } from '@/modules/post/app/IPost.service';
import { PostService } from '@/modules/post/app/impl/Post.service';
import { AnalyticInfraModule } from '@/modules/analytic/infra/Analytic.infra.module';
import { CommentPrivateController } from '@/modules/post/interfaces/Comment.private.controller';
import { ICommentService } from '@/modules/post/app/IComment.service';
import { CommentService } from '@/modules/post/app/impl/Comment.service';
import { FileStorageModule } from '@/modules/file-storage/FileStorage.module';
import { PostUserController } from './interfaces/Post.user.controller';
import { PostInfraModule } from './infra/Post.infra.module';
import { BusinessInfraModule } from '@/modules/business/infra/Business.infra.module';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { IAnnouncementService } from '@/modules/post/app/IAnnouncement.service';
import { AnnouncementService } from '@/modules/post/app/impl/Announcement.service';
import { IAnnouncementQueryService } from '@/modules/post/app/IAnnouncementQuery.service';
import { AnnouncementQueryService } from '@/modules/post/app/impl/AnnouncementQuery.service';
import { AnnouncementOwnerController } from '@/modules/post/interfaces/Announcement.owner.controller';
import { AnnouncementPublicController } from '@/modules/post/interfaces/Announcement.public.controller';

@Module({
  imports: [
    PostInfraModule,
    AnalyticInfraModule,
    FileStorageModule,
    BusinessInfraModule,
    AccountInfraModule,
  ],
  controllers: [
    PostPublicController,
    CommentPrivateController,
    PostUserController,
    AnnouncementPublicController,
    AnnouncementOwnerController,
  ],
  providers: [
    {
      provide: IPostService,
      useClass: PostService,
    },
    {
      provide: ICommentService,
      useClass: CommentService,
    },
    {
      provide: IAnnouncementService,
      useClass: AnnouncementService,
    },
    {
      provide: IAnnouncementQueryService,
      useClass: AnnouncementQueryService,
    },
  ],
})
export class PostModule {}

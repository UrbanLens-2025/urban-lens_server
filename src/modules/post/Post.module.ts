import { Module } from '@nestjs/common';
import { PostPublicController } from '@/modules/post/interfaces/Post.public.controller';
import { IPostService } from '@/modules/post/app/IPost.service';
import { PostService } from '@/modules/post/app/impl/Post.service';
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
import { PostReactionPublisherListener } from '@/modules/post/app/listener/PostReactionPublisher.listener';
import { ReviewPostPublisherListener } from '@/modules/post/app/listener/ReviewPostPublisher.listener';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTagsEntity } from '@/modules/account/domain/UserTags.entity';
import { PostEntity } from '@/modules/post/domain/Post.entity';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';
import { EventTagsEntity } from '@/modules/event/domain/EventTags.entity';
import { ClientsModule } from '@nestjs/microservices';
import { getRabbitMQConfig } from '@/config/rabbitmq.config';
import { AnnouncementCreatorController } from '@/modules/post/interfaces/Announcement.creator.controller';
import { PostCreatorController } from '@/modules/post/interfaces/Post.creator.controller';
import { PostOwnerController } from '@/modules/post/interfaces/Post.owner.controller';
import { IPostQueryService } from '@/modules/post/app/PostQuery.service';
import { PostQueryService } from '@/modules/post/app/impl/PostQuery.service';

@Module({
  imports: [
    PostInfraModule,
    FileStorageModule,
    BusinessInfraModule,
    AccountInfraModule,
    TypeOrmModule.forFeature([
      UserTagsEntity,
      PostEntity,
      LocationTagsEntity,
      EventTagsEntity,
    ]),
    ClientsModule.register(getRabbitMQConfig()),
  ],
  controllers: [
    PostPublicController,
    CommentPrivateController,
    PostUserController,
    AnnouncementPublicController,
    AnnouncementOwnerController,
    AnnouncementCreatorController,
    PostCreatorController,
    PostOwnerController,
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
    {
      provide: IPostQueryService,
      useClass: PostQueryService,
    },
    PostReactionPublisherListener,
    ReviewPostPublisherListener,
  ],
})
export class PostModule {}

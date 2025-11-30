import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from '@/modules/utility/domain/Tag.entity';
import { ProvinceEntity } from '@/modules/utility/domain/Province.entity';
import { WardEntity } from '@/modules/utility/domain/Ward.entity';
import { TagCategoryEntity } from '@/modules/utility/domain/TagCategory.entity';
import { TagCategoryRepository } from '@/modules/utility/infra/repository/TagCategory.repository';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';
import { EventTagsEntity } from '@/modules/event/domain/EventTags.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TagEntity,
      ProvinceEntity,
      WardEntity,
      TagCategoryEntity,
      LocationTagsEntity,
      EventTagsEntity,
    ]),
  ],
  providers: [TagCategoryRepository],
  exports: [TagCategoryRepository],
})
export class UtilityInfraModule {}

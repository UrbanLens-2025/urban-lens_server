import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from '@/modules/utility/domain/Tag.entity';
import { ProvinceEntity } from '@/modules/utility/domain/Province.entity';
import { WardEntity } from '@/modules/utility/domain/Ward.entity';
import { TagCategoryEntity } from '@/modules/utility/domain/TagCategory.entity';
import { TagCategoryRepository } from '@/modules/utility/infra/repository/TagCategory.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TagEntity,
      ProvinceEntity,
      WardEntity,
      TagCategoryEntity,
    ]),
  ],
  providers: [TagCategoryRepository],
  exports: [TagCategoryRepository],
})
export class UtilityInfraModule {}

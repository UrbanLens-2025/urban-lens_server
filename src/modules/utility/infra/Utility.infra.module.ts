import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from '@/modules/utility/domain/Tag.entity';
import { ProvinceEntity } from '@/modules/utility/domain/Province.entity';
import { WardEntity } from '@/modules/utility/domain/Ward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity, ProvinceEntity, WardEntity])],
})
export class UtilityInfraModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvinceEntity } from '@/modules/address/domain/Province.entity';
import { WardEntity } from '@/modules/address/domain/Ward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProvinceEntity, WardEntity])],
})
export class AddressInfraModule {}

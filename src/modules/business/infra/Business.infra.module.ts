import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from '../domain/Location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LocationEntity])],
  exports: [TypeOrmModule],
})
export class BusinessInfraModule {}

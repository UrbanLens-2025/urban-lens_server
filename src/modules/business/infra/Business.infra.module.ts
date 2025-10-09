import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from '../domain/Location.entity';
import { CheckInEntity } from '../domain/CheckIn.entity';
import { LocationRepository } from './repository/Location.repository';
import { CheckInRepository } from './repository/CheckIn.repository';

const repositories = [LocationRepository, CheckInRepository];

@Module({
  imports: [TypeOrmModule.forFeature([LocationEntity, CheckInEntity])],
  providers: repositories,
  exports: repositories,
})
export class BusinessInfraModule {}

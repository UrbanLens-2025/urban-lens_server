import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticEntity } from '../domain/Analytic.entity';
import { Module } from '@nestjs/common';
import { AnalyticRepository } from './repository/Analytic.repository';

const repositories = [AnalyticRepository];

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticEntity])],
  providers: repositories,
  exports: repositories,
})
export class AnalyticInfraModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from '../domain/Report.entity';
import { ReportRepository } from './repository/Report.repository';

const repositories = [ReportRepository];

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity])],
  providers: repositories,
  exports: repositories,
})
export class ReportInfraModule {}

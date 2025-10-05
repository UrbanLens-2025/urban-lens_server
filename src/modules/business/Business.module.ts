import { Module } from '@nestjs/common';
import { BusinessInfraModule } from '@/modules/business/infra/Business.infra.module';

@Module({
  imports: [BusinessInfraModule],
  exports: [BusinessInfraModule],
})
export class BusinessModule {}

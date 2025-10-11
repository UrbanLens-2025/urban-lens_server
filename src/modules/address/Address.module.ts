import { Module } from '@nestjs/common';
import { AddressInfraModule } from '@/modules/address/infra/Address.infra.module';
import { AddressAdminController } from '@/modules/address/interfaces/Address.admin.controller';
import { AddressPublicController } from '@/modules/address/interfaces/Address.public.controller';
import { IWardService } from '@/modules/address/app/IWard.service';
import { WardService } from '@/modules/address/app/impl/Ward.service';
import { IProvinceService } from '@/modules/address/app/IProvince.service';
import { ProvinceService } from '@/modules/address/app/impl/Province.service';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheMemoryConfig } from '@/config/cache.memory.config';

@Module({
  imports: [
    AddressInfraModule,
    CacheModule.registerAsync({
      useClass: CacheMemoryConfig,
    }),
  ],
  controllers: [AddressAdminController, AddressPublicController],
  providers: [
    {
      provide: IWardService,
      useClass: WardService,
    },
    {
      provide: IProvinceService,
      useClass: ProvinceService,
    },
  ],
})
export class AddressModule {}

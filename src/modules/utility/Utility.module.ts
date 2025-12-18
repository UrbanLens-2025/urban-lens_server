import { Module } from '@nestjs/common';
import { UtilityInfraModule } from '@/modules/utility/infra/Utility.infra.module';
import { ITagService } from '@/modules/utility/app/ITag.service';
import { TagService } from '@/modules/utility/app/impl/Tag.service';
import { TagAdminController } from '@/modules/utility/interfaces/Tag.admin.controller';
import { TagPublicController } from '@/modules/utility/interfaces/Tag.public.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheMemoryConfig } from '@/config/cache.memory.config';
import { AddressAdminController } from '@/modules/utility/interfaces/Address.admin.controller';
import { AddressPublicController } from '@/modules/utility/interfaces/Address.public.controller';
import { IWardService } from '@/modules/utility/app/IWard.service';
import { WardService } from '@/modules/utility/app/impl/Ward.service';
import { IProvinceService } from '@/modules/utility/app/IProvince.service';
import { ProvinceService } from '@/modules/utility/app/impl/Province.service';
import { ITagCategoryService } from '@/modules/utility/app/ITagCategory.service';
import { TagCategoryService } from '@/modules/utility/app/impl/TagCategory.service';
import { TagCategoryController } from '@/modules/utility/interfaces/TagCategory.controller';
import { ISystemConfigService } from '@/modules/utility/app/ISystemConfig.service';
import { SystemConfigService } from '@/modules/utility/app/impl/SystemConfig.service';
import { SystemConfigAdminController } from '@/modules/utility/interfaces/SystemConfig.admin.controller';
import { SystemConfigPublicController } from '@/modules/utility/interfaces/SystemConfig.public.controller';

@Module({
  imports: [
    UtilityInfraModule,
    CacheModule.registerAsync({
      useClass: CacheMemoryConfig,
    }),
  ],
  providers: [
    {
      provide: ITagService,
      useClass: TagService,
    },
    {
      provide: IWardService,
      useClass: WardService,
    },
    {
      provide: IProvinceService,
      useClass: ProvinceService,
    },
    {
      provide: ITagCategoryService,
      useClass: TagCategoryService,
    },
    {
      provide: ISystemConfigService,
      useClass: SystemConfigService,
    },
  ],
  controllers: [
    TagAdminController,
    TagPublicController,
    AddressAdminController,
    AddressPublicController,
    TagCategoryController,
    SystemConfigAdminController,
    SystemConfigPublicController,
  ],
  exports: [ISystemConfigService],
})
export class UtilityModule {}

import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { LocationRequestRepository } from '@/modules/business/infra/repository/LocationRequest.repository';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';

@Injectable()
export class AppService extends CoreService {
  getHello(): string {
    return 'Hello World!';
  }

  async testFindError() {
    const accountRepository = AccountRepositoryProvider(this.dataSource);
    await accountRepository.findOneByOrFail({
      id: 'd03ce7a0-a2af-4aa3-8774-a1d85a96f192',
    });
  }

  async testSearchAndFilter(query: PaginateQuery) {
    const wardRepository = LocationRequestRepository(this.dataSource);
    return paginate(query, wardRepository, AppService.testSearchAndFilter);
  }
  public static readonly testSearchAndFilter: PaginateConfig<LocationRequestEntity> =
    {
      sortableColumns: ['name', 'createdAt'],
      defaultSortBy: [['createdAt', 'ASC']],
      nullSort: 'last',
      searchableColumns: ['name'],
      filterableColumns: {
        name: true,
        status: true,
      },
    };
}

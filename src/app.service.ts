import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { AccountRepositoryProvider } from '@/modules/auth/infra/repository/Account.repository';

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
}

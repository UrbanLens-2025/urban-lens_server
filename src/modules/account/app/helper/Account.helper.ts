import { CoreService } from '@/common/core/Core.service';
import { Injectable, Logger } from '@nestjs/common';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { Role } from '@/common/constants/Role.constant';
import { UserProfileRepositoryProvider } from '@/modules/account/infra/repository/UserProfile.repository';
import { BusinessRepositoryProvider } from '@/modules/account/infra/repository/Business.repository';
import { EntityManager, In } from 'typeorm';

@Injectable()
export class AccountHelper extends CoreService {
  private readonly logger = new Logger(AccountHelper.name);

  async populateProfile(
    accounts: (AccountEntity | null | undefined)[],
    em?: EntityManager,
  ) {
    if (!accounts || accounts.length === 0) {
      return [];
    }

    // filter null or undefined accounts
    // filter un-onboarded accounts
    const validAccounts: AccountEntity[] = accounts
      .filter((acc): acc is AccountEntity => this.isDefined(acc))
      .filter((acc) => acc.hasOnboarded);
    const validAccountIds = validAccounts.map((i) => i.id);

    if (validAccounts.length === 0) {
      return [];
    }

    const userProfileRepository = UserProfileRepositoryProvider(
        em ?? this.dataSource,
      ),
      businessProfileRepository = BusinessRepositoryProvider(
        em ?? this.dataSource,
      );

    const userProfiles = await userProfileRepository.find({
      where: {
        accountId: In(validAccountIds),
      },
    });

    const businessProfiles = await businessProfileRepository.find({
      where: {
        accountId: In(validAccountIds),
      },
    });

    return validAccounts.map((account) => {
      switch (account.role) {
        case Role.USER: {
          account.userProfile = userProfiles.find(
            (profile) => profile.accountId === account.id,
          );
          break;
        }
        case Role.BUSINESS_OWNER: {
          account.businessProfile = businessProfiles.find(
            (profile) => profile.accountId === account.id,
          );
          break;
        }
        default: {
          this.logger.warn(
            `Unknown role ${account.role} for account ${account.id}`,
          );
          break;
        }
      }

      return account;
    });
  }
}

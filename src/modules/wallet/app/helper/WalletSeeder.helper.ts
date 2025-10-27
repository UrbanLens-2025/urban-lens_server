import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';
import { WalletType } from '@/common/constants/WalletType.constant';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { CoreService } from '@/common/core/Core.service';
import { In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';

@Injectable()
export class WalletSeederHelper extends CoreService implements OnModuleInit {
  public readonly SYSTEM_WALLET_ID = '19042003-1904-4444-bbbb-bbbbbbbbbbbb';
  public readonly ESCROW_WALLET_ID = '19042003-1904-4444-aaaa-aaaaaaaaaaaa';
  private readonly LOGGER = new Logger(WalletSeederHelper.name);

  constructor(private readonly configService: ConfigService<Environment>) {
    super();
  }

  async onModuleInit() {
    if (!this.configService.get('ENABLE_WALLET_SEEDING')) {
      // skip seeding
      return;
    }

    this.LOGGER.debug('Seeding system wallets if they do not exist...');

    const walletRepository = WalletRepository(this.dataSource);

    // Check if system wallets exist
    const existingWallets = await walletRepository.find({
      where: {
        id: In([this.SYSTEM_WALLET_ID, this.ESCROW_WALLET_ID]),
      },
      select: { id: true, walletType: true },
    });

    const existingIds = existingWallets.map((w) => w.id);

    const walletsToCreate: WalletEntity[] = [];

    // Create SYSTEM wallet if it doesn't exist
    if (!existingIds.includes(this.SYSTEM_WALLET_ID)) {
      const systemWallet = new WalletEntity();
      systemWallet.id = this.SYSTEM_WALLET_ID;
      systemWallet.ownedBy = null;
      systemWallet.walletType = WalletType.SYSTEM;
      systemWallet.currency = SupportedCurrency.VND;
      systemWallet.balance = 0;
      systemWallet.totalTransactions = 0;
      systemWallet.isLocked = false;
      systemWallet.createdById = this.SYSTEM_WALLET_ID;
      walletsToCreate.push(systemWallet);
    }

    // Create ESCROW wallet if it doesn't exist
    if (!existingIds.includes(this.ESCROW_WALLET_ID)) {
      const escrowWallet = new WalletEntity();
      escrowWallet.id = this.ESCROW_WALLET_ID;
      escrowWallet.ownedBy = null;
      escrowWallet.walletType = WalletType.ESCROW;
      escrowWallet.currency = SupportedCurrency.VND;
      escrowWallet.balance = 0;
      escrowWallet.totalTransactions = 0;
      escrowWallet.isLocked = false;
      escrowWallet.createdById = this.SYSTEM_WALLET_ID;
      walletsToCreate.push(escrowWallet);
    }

    if (walletsToCreate.length === 0) {
      this.LOGGER.debug('System wallets already exist. Skipping seeding.');
      return;
    }

    try {
      await walletRepository.save(walletsToCreate);
      this.LOGGER.debug(
        `Successfully created ${walletsToCreate.length} system wallet(s): ${walletsToCreate.map((w) => w.walletType).join(', ')}`,
      );
    } catch (error) {
      this.LOGGER.error('Error creating system wallets:', error);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IWalletTransactionQueryService } from '@/modules/wallet/app/IWalletTransactionQuery.service';
import { GetTransactionByIdDto } from '@/common/dto/wallet/GetTransactionById.dto';
import { GetTransactionByCodeDto } from '@/common/dto/wallet/GetTransactionByCode.dto';
import { GetTransactionsByWalletIdDto } from '@/common/dto/wallet/GetTransactionsByWalletId.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { Paginated } from 'nestjs-paginate';

@Injectable()
export class WalletTransactionQueryService
  extends CoreService
  implements IWalletTransactionQueryService
{
  getTransactionById(
    dto: GetTransactionByIdDto,
  ): Promise<WalletTransactionResponseDto | null> {
    throw new Error('Method not implemented.');
  }

  getTransactionByCode(
    dto: GetTransactionByCodeDto,
  ): Promise<WalletTransactionResponseDto | null> {
    throw new Error('Method not implemented.');
  }

  getTransactionsByWalletId(
    dto: GetTransactionsByWalletIdDto,
  ): Promise<Paginated<WalletTransactionResponseDto>> {
    throw new Error('Method not implemented.');
  }
}

import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import {
  IGamificationQueryService,
  IGamificationQueryService_QueryConfig,
} from '../IGamificationQuery.service';
import { GetMissionParticipantsDto } from '@/common/dto/gamification/GetMissionParticipants.dto';
import { GetVoucherUsersDto } from '@/common/dto/gamification/GetVoucherUsers.dto';
import { MissionParticipantResponseDto } from '@/common/dto/gamification/MissionParticipant.response.dto';
import { VoucherUserResponseDto } from '@/common/dto/gamification/VoucherUser.response.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { UserMissionProgressRepositoryProvider } from '@/modules/gamification/infra/repository/UserMissionProgress.repository';
import { UserLocationVoucherExchangeHistoryRepositoryProvider } from '@/modules/gamification/infra/repository/UserLocationVoucherExchangeHistory.repository';

@Injectable()
export class GamificationQueryService
  extends CoreService
  implements IGamificationQueryService
{
  constructor() {
    super();
  }

  async getMissionParticipants(
    dto: GetMissionParticipantsDto,
  ): Promise<Paginated<MissionParticipantResponseDto>> {
    return paginate(
      dto.query,
      UserMissionProgressRepositoryProvider(this.dataSource),
      {
        ...IGamificationQueryService_QueryConfig.getMissionParticipants(),
        where: {
          mission: {
            location: {
              businessId: dto.businessOwnerId,
            },
          },
        },
      },
    ).then((res) => this.mapToPaginated(MissionParticipantResponseDto, res));
  }

  async getVoucherUsers(
    dto: GetVoucherUsersDto,
  ): Promise<Paginated<VoucherUserResponseDto>> {
    return paginate(
      dto.query,
      UserLocationVoucherExchangeHistoryRepositoryProvider(this.dataSource),
      {
        ...IGamificationQueryService_QueryConfig.getVoucherUsers(),
        where: {
          voucher: {
            location: {
              businessId: dto.businessOwnerId,
            },
          },
        },
      },
    ).then((res) => this.mapToPaginated(VoucherUserResponseDto, res));
  }
}

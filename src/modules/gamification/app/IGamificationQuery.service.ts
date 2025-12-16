import { Paginated, PaginateConfig } from 'nestjs-paginate';
import { MissionParticipantResponseDto } from '@/common/dto/gamification/MissionParticipant.response.dto';
import { VoucherUserResponseDto } from '@/common/dto/gamification/VoucherUser.response.dto';
import { GetMissionParticipantsDto } from '@/common/dto/gamification/GetMissionParticipants.dto';
import { GetVoucherUsersDto } from '@/common/dto/gamification/GetVoucherUsers.dto';
import { UserMissionProgressEntity } from '@/modules/gamification/domain/UserMissionProgress.entity';
import { UserLocationVoucherExchangeHistoryEntity } from '@/modules/gamification/domain/UserLocationVoucherExchangeHistory.entity';

export const IGamificationQueryService = Symbol('IGamificationQueryService');

export interface IGamificationQueryService {
  getMissionParticipants(
    dto: GetMissionParticipantsDto,
  ): Promise<Paginated<MissionParticipantResponseDto>>;

  getVoucherUsers(
    dto: GetVoucherUsersDto,
  ): Promise<Paginated<VoucherUserResponseDto>>;
}

export namespace IGamificationQueryService_QueryConfig {
  export function getMissionParticipants(): PaginateConfig<UserMissionProgressEntity> {
    return {
      sortableColumns: ['progress', 'completed'],
      defaultSortBy: [['progress', 'DESC']],
      searchableColumns: [],
      filterableColumns: {
        completed: true,
        missionId: true,
      },
      relations: {
        userProfile: {
          account: true,
        },
        mission: true,
      },
    };
  }

  export function getVoucherUsers(): PaginateConfig<UserLocationVoucherExchangeHistoryEntity> {
    return {
      sortableColumns: ['createdAt', 'usedAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['userVoucherCode'],
      filterableColumns: {
        usedAt: true,
        voucherId: true,
      },
      relations: {
        userProfile: {
          account: true,
        },
        voucher: true,
      },
    };
  }
}


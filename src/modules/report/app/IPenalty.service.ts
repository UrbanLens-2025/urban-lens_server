import { CreatePenalty_WarnUserDto } from '@/common/dto/report/CreatePenalty_WarnUser.dto';
import { CreatePenalty_SuspendAccountDto } from '@/common/dto/report/CreatePenalty_SuspendAccount.dto';
import { CreatePenalty_BanAccountDto } from '@/common/dto/report/CreatePenalty_BanAccount.dto';
import { CreatePenalty_SuspendLocationBookingAbilityDto } from '@/common/dto/report/CreatePenalty_SuspendLocationBookingAbility.dto';
import { CreatePenalty_BanPostDto } from '@/common/dto/report/CreatePenalty_BanPost.dto';
import { PenaltyResponseDto } from '@/common/dto/report/res/Penalty.response.dto';
import { GetPenaltiesByTargetDto } from '@/common/dto/report/GetPenaltiesByTarget.dto';
import { GetPenaltiesByTargetOwnerDto } from '@/common/dto/report/GetPenaltiesByTargetOwner.dto';
import { CreatePenalty_SuspendEventCreationAbilityDto } from '@/common/dto/report/CreatePenalty_SuspendEventCreationAbility.dto';
import { CreatePenalty_ForceCancelEventDto } from '@/common/dto/report/CreatePenalty_ForceCancelEvent.dto';
import { CreatePenalty_SuspendLocationDto } from '@/common/dto/report/CreatePenalty_SuspendLocation.dto';

export const IPenaltyService = Symbol('IPenaltyService');

export interface IPenaltyService {
  createPenalty_WarnUser(
    dto: CreatePenalty_WarnUserDto,
  ): Promise<PenaltyResponseDto>;
  createPenalty_SuspendAccount(
    dto: CreatePenalty_SuspendAccountDto,
  ): Promise<PenaltyResponseDto>;
  createPenalty_BanAccount(
    dto: CreatePenalty_BanAccountDto,
  ): Promise<PenaltyResponseDto>;
  createPenalty_SuspendLocationBookingAbility(
    dto: CreatePenalty_SuspendLocationBookingAbilityDto,
  ): Promise<PenaltyResponseDto>;
  createPenalty_BanPost(
    dto: CreatePenalty_BanPostDto,
  ): Promise<PenaltyResponseDto>;
  createPenalty_SuspendEventCreationAbility(
    dto: CreatePenalty_SuspendEventCreationAbilityDto,
  ): Promise<PenaltyResponseDto>;
  createPenalty_ForceCancelEvent(
    dto: CreatePenalty_ForceCancelEventDto,
  ): Promise<PenaltyResponseDto>;
  createPenalty_SuspendLocation(
    dto: CreatePenalty_SuspendLocationDto,
  ): Promise<PenaltyResponseDto>;
  getPenaltiesByTarget(
    dto: GetPenaltiesByTargetDto,
  ): Promise<PenaltyResponseDto[]>;
  getPenaltiesByTargetOwner(
    dto: GetPenaltiesByTargetOwnerDto,
  ): Promise<PenaltyResponseDto[]>;
}

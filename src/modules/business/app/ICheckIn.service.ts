import { CreateCheckInDto } from '@/common/dto/checkin/CreateCheckIn.dto';
import { GetCheckInsQueryDto } from '@/common/dto/checkin/GetCheckInsQuery.dto';
import { CheckInEntity } from '../domain/CheckIn.entity';
import { PaginationResult } from '@/common/services/base.service';

export interface ICheckInService {
  createCheckIn(
    profileId: string,
    createCheckInDto: CreateCheckInDto,
  ): Promise<CheckInEntity>;

  getCheckInsByProfileId(
    profileId: string,
    queryDto: GetCheckInsQueryDto,
  ): Promise<PaginationResult<CheckInEntity>>;
}

export const ICheckInService = Symbol('ICheckInService');

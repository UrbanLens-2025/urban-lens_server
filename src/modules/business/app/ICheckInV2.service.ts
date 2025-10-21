import { RegisterCheckInDto } from '@/common/dto/RegisterCheckIn.dto';
import { CheckInResponseDto } from '@/common/dto/business/res/CheckIn.response.dto';
import { Paginated } from 'nestjs-paginate';
import { GetMyCheckInsDto } from '@/common/dto/business/GetMyCheckIns.dto';
import { GetMyCheckInByLocationIdDto } from '@/common/dto/business/GetMyCheckInByLocationId.dto';

export const ICheckInV2Service = Symbol('ICheckInV2Service');
export interface ICheckInV2Service {
  registerCheckIn(dto: RegisterCheckInDto): Promise<CheckInResponseDto>;
  getMyCheckIns(dto: GetMyCheckInsDto): Promise<Paginated<CheckInResponseDto>>;
  getMyCheckInByLocationId(
    dto: GetMyCheckInByLocationIdDto,
  ): Promise<CheckInResponseDto>;
}

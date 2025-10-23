import { RegisterCheckInDto } from '@/common/dto/RegisterCheckIn.dto';
import { CheckInResponseDto } from '@/common/dto/business/res/CheckIn.response.dto';
import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { GetMyCheckInsDto } from '@/common/dto/business/GetMyCheckIns.dto';
import { GetMyCheckInByLocationIdDto } from '@/common/dto/business/GetMyCheckInByLocationId.dto';
import { CheckInEntity } from '@/modules/business/domain/CheckIn.entity';

export const ICheckInV2Service = Symbol('ICheckInV2Service');
export interface ICheckInV2Service {
  registerCheckIn(dto: RegisterCheckInDto): Promise<CheckInResponseDto>;
  getMyCheckIns(dto: GetMyCheckInsDto): Promise<Paginated<CheckInResponseDto>>;
  getMyCheckInByLocationId(
    dto: GetMyCheckInByLocationIdDto,
  ): Promise<CheckInResponseDto>;
}

export namespace ICheckInV2Service_QueryConfig {
  export function getMyCheckIns(): PaginateConfig<CheckInEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      relations: {
        location: true,
      },
    };
  }
}

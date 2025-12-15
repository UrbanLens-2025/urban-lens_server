import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { Expose, Type } from 'class-transformer';

export class LocationWithReportsResponseDto extends LocationResponseDto {
  @Expose()
  @Type(() => ReportResponseDto)
  reports: ReportResponseDto[];
}


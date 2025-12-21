import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { Expose, Type } from 'class-transformer';

export class LocationBookingWithReportsResponseDto extends LocationBookingResponseDto {
  @Expose()
  @Type(() => ReportResponseDto)
  reports: ReportResponseDto[];
}


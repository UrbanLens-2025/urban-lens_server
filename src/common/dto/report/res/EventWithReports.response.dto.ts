import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { Expose, Type } from 'class-transformer';

export class EventWithReportsResponseDto extends EventResponseDto {
  @Expose()
  @Type(() => ReportResponseDto)
  reports: ReportResponseDto[];
}


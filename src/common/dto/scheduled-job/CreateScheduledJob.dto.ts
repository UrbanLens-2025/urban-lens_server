import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { type ScheduledJobPayload, ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';
import { IsAfterToday } from '@/common/decorators/IsAfterToday.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateScheduledJobDto<T extends ScheduledJobType> extends CoreActionDto {
  @IsEnum(ScheduledJobType)
  @IsNotEmpty()
  @ApiProperty({ enum: ScheduledJobType })
  jobType: T;

  @IsDate()
  @IsAfterToday()
  @Type(() => Date)
  @ApiProperty({ description: 'The date and time to execute the job' })
  executeAt: Date;

  @IsObject()
  @Type(() => Object)
  @ApiProperty({ description: 'The payload of the job' })
  payload: ScheduledJobPayload<T>;
}

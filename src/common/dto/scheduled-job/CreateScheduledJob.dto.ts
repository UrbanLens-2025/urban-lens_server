import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { IsDate, IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import {
  type ScheduledJobPayload,
  ScheduledJobType,
} from '@/common/constants/ScheduledJobType.constant';
import { IsAfterToday } from '@/common/decorators/IsAfterToday.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateScheduledJobDto<
  T extends ScheduledJobType,
> extends CoreActionDto {
  @IsEnum(ScheduledJobType)
  @IsNotEmpty()
  @ApiProperty({ enum: ScheduledJobType })
  jobType: T;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The id of the associated entity' })
  associatedId: string;

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

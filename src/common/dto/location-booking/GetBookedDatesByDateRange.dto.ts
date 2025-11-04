import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';

export class GetBookedDatesByDateRangeDto {
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @IsBefore('endDate')
  @ApiProperty()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  endDate: Date;
}

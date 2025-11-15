import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';

export class GetBookedDatesByDateRangeDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  locationId: string;

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

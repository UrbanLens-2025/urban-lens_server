import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
export class ProcessReport_TicketRefundDto extends CoreActionDto {
  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true })
  reportIds: string[];

  @ApiProperty()
  @IsString()
  @MaxLength(555)
  @IsNotEmpty()
  reason: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsNotEmpty()
  refundPercentage: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  shouldCancelTickets: boolean;

  @Exclude()
  createdById: string;
}

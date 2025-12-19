import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateFineForBookingDto extends CoreActionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @IsNotEmpty()
  fineAmount: number;

  @ApiProperty({ example: 'Late check-in' })
  @IsString()
  @IsNotEmpty()
  fineReason: string;

  @Exclude()
  createdById: string;
}

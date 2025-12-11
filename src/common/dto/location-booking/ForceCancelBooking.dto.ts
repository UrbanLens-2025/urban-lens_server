import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString, IsNotEmpty, Length } from 'class-validator';

@Expose()
export class ForceCancelBookingDto extends CoreActionDto {
  @Exclude()
  bookingId: string;
  @Exclude()
  accountId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 555)
  cancellationReason: string;
}

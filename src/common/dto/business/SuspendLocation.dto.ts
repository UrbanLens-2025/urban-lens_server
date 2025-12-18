import { Exclude, Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsAfterToday } from '@/common/decorators/IsAfterToday.decorator';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class SuspendLocationDto extends CoreActionDto {
  @Exclude()
  locationId: string;

  @Exclude()
  executedById: string;

  @ApiProperty({
    example: 'Location was suspended by the admin.',
    description: 'The reason for suspending the location.',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    example: '2025-12-18T12:00:00.000Z',
    description: 'The date and time until the location is suspended.',
  })
  @IsDate()
  @IsAfterToday()
  @IsNotEmpty()
  @Type(() => Date)
  suspendedUntil: Date;
}

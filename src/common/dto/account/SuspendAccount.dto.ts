import { IsAfterToday } from '@/common/decorators/IsAfterToday.decorator';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { IsDate, IsString, MaxLength } from 'class-validator';

export class SuspendAccountDto extends CoreActionDto {
  @ApiProperty({})
  @IsDate()
  @IsAfterToday()
  @Type(() => Date)
  suspendUntil: Date;

  @ApiProperty({})
  @IsString()
  @MaxLength(555)
  suspensionReason: string;

  @Exclude()
  targetId: string;

  @Exclude()
  accountId?: string | null;
}

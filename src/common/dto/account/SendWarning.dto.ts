import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendWarningDto extends CoreActionDto {
  @Exclude()
  targetAccountId: string;
  @Exclude()
  createdById: string;

  @ApiProperty()
  @IsString()
  @MaxLength(555)
  @IsNotEmpty()
  warningNote: string;
}

import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePenalty_BanPostDto extends CoreActionDto {
  @ApiProperty({})
  @IsUUID()
  @IsNotEmpty()
  targetEntityId: string;

  @ApiProperty({
    enum: ReportEntityType,
    example: ReportEntityType.POST,
  })
  @IsEnum(ReportEntityType)
  @IsNotEmpty()
  targetEntityType: ReportEntityType;

  @ApiProperty({})
  @IsString()
  @MaxLength(555)
  banReason: string;

  @Exclude()
  createdById: string;
}

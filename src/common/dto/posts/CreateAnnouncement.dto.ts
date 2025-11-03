import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';
import { Type } from 'class-transformer';

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'Title of the announcement' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Description/content of the announcement' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Visible from this date (inclusive)',
    type: String,
    example: new Date().toISOString(),
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @IsBefore('endDate')
  startDate: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsNotEmpty()
  @IsDate()
  endDate: Date;

  @ApiProperty({
    example: 'https://google.com',
  })
  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  locationId: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isHidden: boolean;

  // Transient - filled from auth token, not part of request body by clients, but allowed here for internal filling
  accountId: string;
}

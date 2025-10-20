import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { BusinessRequestStatus } from '@/common/constants/Business.constant';

export class UpdateBusinessStatusDto {
  @ApiProperty({
    description: 'New status for the business',
    enum: BusinessRequestStatus,
    example: BusinessRequestStatus.APPROVED,
  })
  @IsEnum(BusinessRequestStatus)
  @IsNotEmpty()
  status: BusinessRequestStatus;

  @ApiPropertyOptional({
    description: 'Admin notes (required when rejecting)',
    example: 'Missing required documentation',
  })
  @ValidateIf((o) => o.status === BusinessRequestStatus.REJECTED)
  @IsNotEmpty({ message: 'Admin notes are required when rejecting a business' })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}

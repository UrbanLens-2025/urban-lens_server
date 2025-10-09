import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { LocationRequestStatus } from '@/common/constants/Location.constant';

export class UpdateLocationStatusDto {
  @ApiProperty({
    description: 'New status for the location',
    enum: LocationRequestStatus,
    example: LocationRequestStatus.APPROVED,
  })
  @IsEnum(LocationRequestStatus)
  @IsNotEmpty()
  status: LocationRequestStatus;

  @ApiPropertyOptional({
    description: 'Admin notes (required when rejecting)',
    example: 'Location does not meet safety requirements',
  })
  @ValidateIf((o) => o.status === LocationRequestStatus.REJECTED)
  @IsNotEmpty({
    message: 'Admin notes are required when rejecting a location',
  })
  @IsString()
  @IsOptional()
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Optional admin notes for approved status',
    example: 'Location verified and meets all requirements',
  })
  @ValidateIf((o) => o.status === LocationRequestStatus.APPROVED)
  @IsOptional()
  @IsString()
  adminNotesOptional?: string;
}

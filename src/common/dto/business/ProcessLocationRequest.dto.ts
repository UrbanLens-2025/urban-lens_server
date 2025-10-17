import { LocationRequestStatus } from '@/common/constants/Location.constant';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class ProcessLocationRequestDto {
  // transient fields
  locationRequestId: string;
  accountId: string;

  // persistent fields
  @ApiProperty({
    enum: LocationRequestStatus,
    example: LocationRequestStatus.APPROVED,
  })
  @IsIn([
    LocationRequestStatus.APPROVED,
    LocationRequestStatus.NEEDS_MORE_INFO,
    LocationRequestStatus.REJECTED,
  ])
  @IsNotEmpty()
  status: LocationRequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(1024)
  adminNotes?: string;
}

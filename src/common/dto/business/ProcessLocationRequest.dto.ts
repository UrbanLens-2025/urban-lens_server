import { LocationRequestStatus } from '@/common/constants/Location.constant';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class ProcessLocationRequestDto {
  // transient fields
  locationRequestId: string;
  accountId: string;

  // persistent fields
  @ApiProperty({ enum: LocationRequestStatus })
  @IsEnum(LocationRequestStatus)
  @IsNotEmpty()
  status: LocationRequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(1024)
  adminNotes?: string;
}

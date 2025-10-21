import { Exclude, Expose, Type } from 'class-transformer';
import { LocationRequestStatus } from '@/common/constants/Location.constant';
import { LocationValidationDocumentsJson } from '@/common/json/LocationValidationDocuments.json';
import { BusinessResponseDto } from '@/common/dto/account/res/Business.response.dto';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { LocationRequestTagsResponseDto } from '@/common/dto/business/res/LocationRequestTags.response.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { LocationRequestType } from '@/common/constants/LocationRequestType.constant';

@Exclude()
export class LocationRequestResponseDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdById: string;

  @Expose()
  @Type(() => AccountResponseDto)
  createdBy: AccountResponseDto;

  @Expose()
  type: LocationRequestType;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  latitude: number;

  @Expose()
  longitude: number;

  @Expose()
  radiusMeters: number;

  @Expose({ name: 'address_line' })
  addressLine: string;

  @Expose({ name: 'address_level_1' })
  addressLevel1: string;

  @Expose({ name: 'address_level_2' })
  addressLevel2: string;

  @Expose()
  locationImageUrls: string[];

  @Expose()
  status: LocationRequestStatus;

  @Expose()
  adminNotes?: string | null;

  @Expose()
  locationValidationDocuments: LocationValidationDocumentsJson[];

  @Expose()
  processedById: string;

  @Expose()
  @Type(() => AccountResponseDto)
  processedBy: AccountResponseDto;

  @Expose()
  @Type(() => LocationRequestTagsResponseDto)
  tags: LocationRequestTagsResponseDto[];

  @Expose()
  @Type(() => LocationResponseDto)
  createdLocation: LocationResponseDto;
}

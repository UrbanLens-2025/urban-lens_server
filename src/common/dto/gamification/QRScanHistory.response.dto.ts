import { Exclude, Expose, Type } from 'class-transformer';
import { AccountResponseDto } from '../account/res/AccountResponse.dto';

@Exclude()
export class UserQRScanHistoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  locationId: string;

  @Expose()
  qrCodeData: string;

  @Expose()
  @Type(() => Date)
  scannedAt: Date;

  @Expose()
  referenceId: string | null;

  @Expose()
  businessOwnerId: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;
}

@Exclude()
export class BusinessQRScanHistoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  locationId: string;

  @Expose()
  qrCodeData: string;

  @Expose()
  scannedBy: string;

  @Expose()
  @Type(() => Date)
  scannedAt: Date;

  @Expose()
  referenceId: string | null;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => AccountResponseDto)
  scannedByUser?: AccountResponseDto;
}

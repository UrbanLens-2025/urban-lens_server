import { Exclude, Expose } from 'class-transformer';
import {
  BusinessCategory,
  BusinessRequestStatus,
} from '@/common/constants/Business.constant';

@Exclude()
export class BusinessResponseDto {
  @Expose()
  accountId: string;

  @Expose()
  avatar?: string;

  @Expose()
  website: string;

  @Expose()
  name: string;

  @Expose()
  addressLine: string;

  @Expose()
  addressLevel1: string;

  @Expose()
  addressLevel2: string;

  @Expose()
  description: string;

  @Expose()
  licenseNumber: string;

  @Expose()
  licenseExpirationDate: string;

  @Expose()
  licenseType: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  status: BusinessRequestStatus;

  @Expose()
  adminNotes?: string | null;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  category: BusinessCategory;
}

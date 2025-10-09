import { CreateCheckInDto } from '@/common/dto/checkin/CreateCheckIn.dto';
import { GetCheckInsQueryDto } from '@/common/dto/checkin/GetCheckInsQuery.dto';
import { CheckInEntity } from '../domain/CheckIn.entity';

export interface ICheckInService {
  createCheckIn(
    profileId: string,
    createCheckInDto: CreateCheckInDto,
  ): Promise<CheckInEntity>;

  getCheckInsWithFilters(queryDto: GetCheckInsQueryDto): Promise<{
    data: CheckInEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Get check-ins by profile ID
   */
  getCheckInsByProfileId(
    profileId: string,
    queryDto: GetCheckInsQueryDto,
  ): Promise<{
    data: CheckInEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Get check-ins by location ID
   */
  getCheckInsByLocationId(
    locationId: string,
    queryDto: GetCheckInsQueryDto,
  ): Promise<{
    data: CheckInEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Get active check-in for a profile (if any)
   */
  getActiveCheckIn(profileId: string): Promise<CheckInEntity | null>;

  /**
   * Update check-in (notes, rating)
   */
  /**
   * Check out (end active check-in)
   */
  checkOut(checkInId: string, profileId: string): Promise<CheckInEntity>;

  /**
   * Get check-in by ID
   */
  getCheckInById(checkInId: string): Promise<CheckInEntity>;

  /**
   * Delete check-in (only by owner)
   */
  deleteCheckIn(checkInId: string, profileId: string): Promise<void>;
}

export const ICheckInService = Symbol('ICheckInService');

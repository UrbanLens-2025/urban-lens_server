import { Exclude, Expose, Type } from 'class-transformer';
import { AnnouncementType } from '@/common/constants/AnnouncementType.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';

@Exclude()
export class AnnouncementResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  createdById: string | null;

  @Expose()
  @Type(() => AccountResponseDto)
  createdBy: AccountResponseDto | null;

  @Expose()
  updatedById: string | null;

  @Expose()
  @Type(() => AccountResponseDto)
  updatedBy: AccountResponseDto | null;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => Date)
  startDate: Date;

  @Expose()
  @Type(() => Date)
  endDate: Date | null;

  @Expose()
  imageUrl: string | null;

  @Expose()
  type: AnnouncementType;

  @Expose()
  locationId: string | null;

  @Expose()
  @Type(() => LocationResponseDto)
  location: LocationResponseDto | null;

  @Expose()
  eventId: string | null;

  @Expose()
  @Type(() => EventResponseDto)
  event: EventResponseDto | null;

  @Expose()
  isHidden: boolean;
}

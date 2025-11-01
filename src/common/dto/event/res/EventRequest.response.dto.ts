import { Exclude, Expose, Type } from 'class-transformer';
import { EventRequestStatus } from '@/common/constants/EventRequestStatus.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { EventRequestTagsResponseDto } from '@/common/dto/event/res/EventRequestTags.response.dto';
import { SocialLink } from '@/common/json/SocialLink.json';

@Exclude()
export class EventRequestResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  createdById: string;

  @Expose()
  @Type(() => AccountResponseDto)
  createdBy?: AccountResponseDto;

  @Expose()
  eventName: string;

  @Expose()
  eventDescription: string;

  @Expose()
  expectedNumberOfParticipants: number;

  @Expose()
  allowTickets: boolean;

  @Expose()
  specialRequirements: string;

  @Expose()
  status: EventRequestStatus;

  @Expose()
  @Type(() => EventRequestTagsResponseDto)
  eventRequestTags: EventRequestTagsResponseDto[];

  @Expose()
  @Type(() => SocialLink)
  socialLinks?: SocialLink[];

  //   @Expose()
  //   referencedLocationBookingId?: string | null;

  //   @Expose()
  //   @Type(() => any)
  //   referencedLocationBooking?: any;
}

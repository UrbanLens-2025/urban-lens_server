import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { EventRequestStatus } from '@/common/constants/EventRequestStatus.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { EventRequestTagsResponseDto } from '@/common/dto/event/res/EventRequestTags.response.dto';
import { SocialLink } from '@/common/json/SocialLink.json';
import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';
import { EventValidationDocumentsJson } from '@/common/json/EventValidationDocuments.json';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { TagCategoryResponseDto } from '@/common/dto/utility/TagCategory.dto';

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
  @Transform(({ value }) => {
    if (!value || !Array.isArray(value)) {
      return undefined;
    }
    return value
      .map((tags: EventRequestTagsResponseDto) => tags?.tagCategory)
      .filter(Boolean);
  })
  tags: TagCategoryResponseDto[];

  @Expose()
  @Type(() => SocialLink)
  socialLinks?: SocialLink[];

  @Expose()
  referencedLocationBookingId?: string;

  @Expose()
  @Type(() => LocationBookingResponseDto)
  referencedLocationBooking?: LocationBookingResponseDto;

  @Expose()
  eventValidationDocuments: EventValidationDocumentsJson[];

  @Expose()
  @Type(() => EventResponseDto)
  referencedEvent?: EventResponseDto | null;
}

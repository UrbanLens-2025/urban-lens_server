import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { EventStatus } from '@/common/constants/EventStatus.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { EventTagsResponseDto } from '@/common/dto/event/res/EventTags.response.dto';
import { SocialLink } from '@/common/json/SocialLink.json';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';
import { TagResponseDto } from '@/common/dto/account/res/TagResponse.dto';
import { EventValidationDocumentsJson } from '@/common/json/EventValidationDocuments.json';
import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';
import { TicketOrderResponseDto } from '@/common/dto/event/res/TicketOrder.response.dto';
import { ScheduledJobResponseDto } from '@/common/dto/scheduled-job/res/ScheduledJob.response.dto';

@Exclude()
export class EventResponseDto {
  @Expose()
  id: string;

  type = 'event';

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
  displayName: string;

  @Expose()
  description: string;

  @Expose()
  avatarUrl?: string | null;

  @Expose()
  coverUrl?: string | null;

  @Expose()
  status: EventStatus;

  @Expose()
  expectedNumberOfParticipants: number;

  @Expose()
  allowTickets: boolean;

  @Expose()
  @Type(() => Date)
  startDate?: Date | null;

  @Expose()
  @Type(() => Date)
  endDate?: Date | null;

  @Expose()
  locationId?: string | null;

  @Expose()
  @Type(() => LocationResponseDto)
  location?: LocationResponseDto;

  @Expose()
  @Type(() => SocialLink)
  social?: SocialLink[] | null;

  @Expose()
  @Type(() => EventValidationDocumentsJson)
  eventValidationDocuments: EventValidationDocumentsJson[];

  @Expose()
  refundPolicy?: string | null;

  @Expose()
  termsAndConditions?: string | null;

  @Expose()
  @Transform(({ value }) => {
    if (!value || !Array.isArray(value)) {
      return undefined;
    }
    return value
      .map((eventTag: EventTagsResponseDto) => eventTag?.tag)
      .filter(Boolean);
  })
  @Type(() => EventTagsResponseDto)
  tags?: TagResponseDto[];

  @Expose()
  @Type(() => EventTicketResponseDto)
  tickets?: EventTicketResponseDto[];

  @Expose()
  @Type(() => TicketOrderResponseDto)
  ticketOrders?: TicketOrderResponseDto[];

  @Expose()
  @Type(() => LocationBookingResponseDto)
  locationBookings?: LocationBookingResponseDto[];

  @Expose()
  hasPaidOut: boolean;

  @Expose()
  @Type(() => Date)
  paidOutAt?: Date | null;

  @Expose()
  scheduledJobId?: number | null;

  @Expose()
  @Type(() => ScheduledJobResponseDto)
  scheduledJob?: ScheduledJobResponseDto;

  @Expose()
  totalReviews: number;

  @Expose()
  avgRating: number;
}

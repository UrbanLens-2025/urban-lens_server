import { Exclude, Expose, Type } from 'class-transformer';
import { EventStatus } from '@/common/constants/EventStatus.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { EventRequestResponseDto } from '@/common/dto/event/res/EventRequest.response.dto';
import { EventTagsResponseDto } from '@/common/dto/event/res/EventTags.response.dto';
import { SocialLink } from '@/common/json/SocialLink.json';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';

@Exclude()
export class EventResponseDto {
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
  locationId: string;

  @Expose()
  @Type(() => LocationResponseDto)
  location?: LocationResponseDto;

  @Expose()
  @Type(() => SocialLink)
  social?: SocialLink[] | null;

  @Expose()
  refundPolicy?: string | null;

  @Expose()
  termsAndConditions?: string | null;

  @Expose()
  referencedEventRequestId: string;

  @Expose()
  @Type(() => EventRequestResponseDto)
  referencedEventRequest?: EventRequestResponseDto;

  @Expose()
  @Type(() => EventTagsResponseDto)
  tags?: EventTagsResponseDto[];

  @Expose()
  @Type(() => EventTicketResponseDto)
  tickets?: EventTicketResponseDto[];
}

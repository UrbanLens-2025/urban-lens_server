import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { EventStatus } from '@/common/constants/EventStatus.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { EventRequestResponseDto } from '@/common/dto/event/res/EventRequest.response.dto';
import { EventTagsResponseDto } from '@/common/dto/event/res/EventTags.response.dto';
import { SocialLink } from '@/common/json/SocialLink.json';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';
import { TagResponseDto } from '@/common/dto/account/res/TagResponse.dto';

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
  @Type(() => Date)
  startDate: Date;

  @Expose()
  @Type(() => Date)
  endDate: Date;

  @Expose()
  locationId: string;

  @Expose()
  @Type(() => LocationResponseDto)
  location?: LocationResponseDto;

  @Expose()
  @Type(() => SocialLink)
  social?: SocialLink[] | null;

  @Expose()
  referencedEventRequestId: string;

  @Expose()
  @Type(() => EventRequestResponseDto)
  referencedEventRequest?: EventRequestResponseDto;

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
}

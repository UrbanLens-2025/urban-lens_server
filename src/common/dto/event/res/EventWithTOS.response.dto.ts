import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { Expose } from 'class-transformer';

export class EventWithTOSResponseDto extends EventResponseDto {
  @Expose()
  refundPolicy?: string | null;

  @Expose()
  termsAndConditions?: string | null;
}

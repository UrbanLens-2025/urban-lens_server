import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class EventResponseDto {
  @Expose()
  id: string;

  @Expose()
  displayName: string;

  @Expose()
  description: string;

  @Expose()
  isDraft: boolean;

  @Expose()
  @Type(() => Date)
  startDate: Date;

  @Expose()
  @Type(() => Date)
  endDate: Date;

  @Expose()
  expectedParticipants: number;

  @Expose()
  avatarUrl?: string;

  @Expose()
  coverUrl?: string;

  @Expose()
  customProperties: Record<string, any>;

  @Expose()
  createdById: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

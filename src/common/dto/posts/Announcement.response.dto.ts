import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AnnouncementResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date | null;

  @Expose()
  imageUrl: string | null;

  @Expose()
  isHidden: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdById: string | null;

  @Expose()
  updatedById: string | null;
}

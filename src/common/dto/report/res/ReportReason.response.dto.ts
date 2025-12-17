import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class ReportReasonResponseDto {
  @Expose()
  key: string;

  @Expose()
  displayName: string;

  @Expose()
  description: string;

  @Expose()
  isActive: boolean;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  forEvent: boolean;

  @Expose()
  forLocation: boolean;

  @Expose()
  forPost: boolean;

  @Expose()
  @Type(() => Number)
  priority: number;
}

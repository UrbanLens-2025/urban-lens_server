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
}

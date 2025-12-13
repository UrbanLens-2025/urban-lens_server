import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SuspensionHistoryJson {
  @Expose()
  suspendedUntil: Date;
  @Expose()
  suspensionReason: string;
  @Expose()
  suspendedById: string;
  @Expose()
  suspendedAt: Date;
}

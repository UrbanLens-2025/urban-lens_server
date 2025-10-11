import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class EventTicketResponseDto {
  @Expose()
  id: string;

  @Expose()
  displayName: string;

  @Expose()
  description?: string;

  @Expose()
  price: number;

  @Expose()
  currency: string;

  @Expose()
  imageUrl?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  tos?: string;

  @Expose()
  totalQuantityAvailable: number;

  @Expose()
  quantityReserved: number;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;
}

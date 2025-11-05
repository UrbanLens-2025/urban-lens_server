import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  ticketId: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  @ApiProperty()
  quantity: number;
}

export class CreateTicketOrderDto {
  // transient fields
  accountId: string;
  eventId: string;
  accountName: string;
  ipAddress: string;
  returnUrl: string;

  @ApiProperty({ isArray: true, type: CreateTicketOrderItemDto })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateTicketOrderItemDto)
  items: CreateTicketOrderItemDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteLocationRequestTagDto {
  // transient fields
  locationRequestId: string;
  accountId: string;

  // persistent fields
  @ApiProperty({ isArray: true, type: Number, example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @IsNotEmpty({ each: true })
  tagIds: string[];
}

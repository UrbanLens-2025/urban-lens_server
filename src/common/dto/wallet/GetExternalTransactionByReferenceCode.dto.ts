import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetExternalTransactionByReferenceCodeDto {
  @ApiProperty({ example: 'REF-123456' })
  @IsNotEmpty()
  @IsString()
  referenceCode: string;
}

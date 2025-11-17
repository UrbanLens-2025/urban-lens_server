import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetReportByIdDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the report',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  reportId: string;
}

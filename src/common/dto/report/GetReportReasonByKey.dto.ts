import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetReportReasonByKeyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Unique key assigned to the report reason',
    example: 'spam',
  })
  key: string;
}


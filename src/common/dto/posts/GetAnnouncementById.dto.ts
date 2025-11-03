import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetAnnouncementByIdDto {
  @ApiProperty({ description: 'Announcement ID' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  publicOnly: boolean;
}

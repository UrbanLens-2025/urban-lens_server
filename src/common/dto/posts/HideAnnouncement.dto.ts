import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class HideAnnouncementDto {
  @ApiProperty({ description: 'Announcement ID' })
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

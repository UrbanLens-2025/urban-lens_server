import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetMyAnnouncementByIdDto {
  @ApiProperty({ description: 'Announcement ID' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  // transient
  accountId: string;
}

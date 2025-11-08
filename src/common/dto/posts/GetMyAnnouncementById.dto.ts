import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetMyAnnouncementByIdDto {
  @ApiProperty({ description: 'Announcement ID' })
  @IsUUID()
  @IsNotEmpty()
  announcementId: string;

  // transient
  accountId: string;
}

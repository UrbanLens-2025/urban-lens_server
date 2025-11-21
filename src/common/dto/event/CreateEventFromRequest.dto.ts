import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventFromRequestDto extends CoreActionDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the event request to create event from',
  })
  eventRequestId: string;
}

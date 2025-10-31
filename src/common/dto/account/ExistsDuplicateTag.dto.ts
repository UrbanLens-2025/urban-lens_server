import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ExistsDuplicateTagDto {
  @ApiProperty()
  @IsNotEmpty()
  displayName: string;
  @ApiProperty()
  @IsNotEmpty()
  groupName: string;
}

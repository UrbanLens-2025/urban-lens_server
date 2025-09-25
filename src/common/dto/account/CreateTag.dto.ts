import { IsHexColor, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export namespace CreateTag {
  export class Dto {
    @IsNotEmpty()
    @ApiProperty()
    displayName: string;
    @IsNotEmpty()
    @IsHexColor()
    @ApiProperty()
    color: string;
    @IsNotEmpty()
    @ApiProperty()
    icon: string;
  }
}

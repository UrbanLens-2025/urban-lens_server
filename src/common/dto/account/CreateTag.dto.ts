import { IsHexColor, IsNotEmpty } from 'class-validator';

export namespace CreateTag {
  export class Dto {
    @IsNotEmpty()
    displayName: string;
    @IsNotEmpty()
    @IsHexColor()
    color: string;
    @IsNotEmpty()
    icon: string;
  }
}

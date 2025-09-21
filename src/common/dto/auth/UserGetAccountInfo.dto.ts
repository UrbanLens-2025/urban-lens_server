import { IsNotEmpty, IsUUID } from 'class-validator';

export namespace UserGetAccountInfo {
  export class Dto {
    @IsNotEmpty()
    @IsUUID()
    userId: string;
  }
}

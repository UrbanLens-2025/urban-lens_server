import { Expose } from 'class-transformer';

export namespace TagResponse {
  export class Dto {
    @Expose()
    id: number;
    @Expose()
    displayName: string;
    @Expose()
    color: string;
    @Expose()
    icon: string;
  }
}

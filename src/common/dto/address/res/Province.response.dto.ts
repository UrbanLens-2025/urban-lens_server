import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProvinceResponseDto {
  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  administrativeLevel: string;
}

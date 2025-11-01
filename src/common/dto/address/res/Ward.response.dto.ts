import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class WardResponseDto {
  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  administrativeLevel: string;

  @Expose()
  provinceCode: string;

  @Expose()
  isVisible: boolean;
}

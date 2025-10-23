import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProvinceEntity } from '@/modules/utility/domain/Province.entity';

@Entity({ name: 'address_ward' })
export class WardEntity {
  @PrimaryColumn({ name: 'code', type: 'varchar', length: 16 })
  code: string;

  @PrimaryColumn({ name: 'name', type: 'varchar', length: 128 })
  name: string;

  @Column({ name: 'administrative_level', type: 'varchar', length: 128 })
  administrativeLevel: string;

  @ManyToOne(() => ProvinceEntity, (province) => province.code, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'province_code' })
  province: ProvinceEntity;

  @Column({ name: 'province_code', type: 'varchar', length: 16 })
  provinceCode: string;
}

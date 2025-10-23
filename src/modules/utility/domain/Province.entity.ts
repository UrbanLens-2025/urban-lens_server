import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'address_province' })
export class ProvinceEntity {
  @PrimaryColumn({ name: 'code', type: 'varchar', length: 16 })
  code: string;

  @Column({ name: 'name', length: 248, type: 'varchar' })
  name: string;

  @Column({ name: 'administrative_level', type: 'varchar', length: 128 })
  administrativeLevel: string;
}

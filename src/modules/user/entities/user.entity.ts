import { Role } from '../enums/role.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'first_name', type: 'varchar', length: 255, nullable: false })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255, nullable: false })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  phoneNumber: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: false })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({
    name: 'role',
    type: 'enum',
    enum: Role,
    nullable: false,
  })
  role: Role;
}

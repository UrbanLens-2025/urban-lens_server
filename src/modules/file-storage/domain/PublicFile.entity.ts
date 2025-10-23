import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { PublicFileStatus } from '@/common/constants/PublicFileStatus.constant';

@Entity('public_file')
export class PublicFileEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'file_name', type: 'varchar', length: 1000 })
  fileName: string;

  @Column({ name: 'file_size_mb', type: 'numeric' })
  fileSizeMb: number;

  @Column({ name: 'file_mime_type', type: 'varchar', length: 100 })
  fileMimeType: string;

  @Column({ name: 'file_url', type: 'varchar', length: 2000, nullable: true })
  fileUrl: string;

  @Column({ name: 'status', type: 'enum', enum: PublicFileStatus })
  status: PublicFileStatus;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    nullable: false,
    cascade: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: AccountEntity;

  @Column({ name: 'created_by' })
  createdById: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static fromFile(file: Express.Multer.File, userId: string) {
    const entity = new PublicFileEntity();
    const fileNameParts: string[] = file.originalname.split('.');
    const fileName = fileNameParts.slice(0, -1).join('.');
    const fileExtension = fileNameParts[fileNameParts.length - 1];
    entity.fileName =
      fileName.replace(/\s+/g, '-') +
      '_' +
      Date.now() +
      '_' +
      userId +
      '.' +
      fileExtension;
    entity.fileSizeMb = file.size / (1024 * 1024);
    entity.fileMimeType = file.mimetype;
    return entity;
  }
}

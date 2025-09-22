import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PublicFileEntity } from '@/modules/file-storage/domain/PublicFile.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PublicFileRepository {
  constructor(
    @InjectRepository(PublicFileEntity)
    public readonly repo: Repository<PublicFileEntity>,
  ) {}
}

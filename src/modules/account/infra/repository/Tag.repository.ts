import { Repository } from 'typeorm';
import { TagEntity } from '@/modules/account/domain/Tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TagRepository {
  constructor(
    @InjectRepository(TagEntity) public readonly repo: Repository<TagEntity>,
  ) {}
}

import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserTagsEntity } from '@/modules/account/domain/UserTags.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserTagsRepository {
  constructor(
    @InjectRepository(UserTagsEntity)
    public readonly repo: Repository<UserTagsEntity>,
  ) {}
}

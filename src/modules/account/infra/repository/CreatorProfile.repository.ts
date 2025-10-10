import { InjectRepository } from '@nestjs/typeorm';
import { CreatorProfileEntity } from '@/modules/account/domain/CreatorProfile.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreatorProfileRepository {
  constructor(
    @InjectRepository(CreatorProfileEntity)
    public readonly repo: Repository<CreatorProfileEntity>,
  ) {}
}

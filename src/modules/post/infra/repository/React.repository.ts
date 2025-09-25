import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReactEntity } from '@/modules/post/domain/React.entity';

@Injectable()
export class ReactRepository {
  constructor(
    @InjectRepository(ReactEntity)
    public readonly repo: Repository<ReactEntity>,
  ) {}
}

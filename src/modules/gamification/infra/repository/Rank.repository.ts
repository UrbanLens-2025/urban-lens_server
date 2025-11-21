import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RankEntity } from '../../domain/Rank.entity';

@Injectable()
export class RankRepository {
  constructor(
    @InjectRepository(RankEntity)
    public readonly repo: Repository<RankEntity>,
  ) {}
}

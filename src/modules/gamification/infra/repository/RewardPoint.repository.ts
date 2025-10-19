import { Injectable } from '@nestjs/common';
import { RewardPointEntity } from '../../domain/RewardPoint.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RewardPointRepository {
  constructor(
    @InjectRepository(RewardPointEntity)
    public readonly repo: Repository<RewardPointEntity>,
  ) {}
}

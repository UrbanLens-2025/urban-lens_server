import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointsHistoryEntity } from '../../domain/PointsHistory.entity';

@Injectable()
export class PointsHistoryRepository {
  constructor(
    @InjectRepository(PointsHistoryEntity)
    public readonly repo: Repository<PointsHistoryEntity>,
  ) {}
}

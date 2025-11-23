import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardSnapshotEntity } from '../../domain/LeaderboardSnapshot.entity';

@Injectable()
export class LeaderboardSnapshotRepository {
  constructor(
    @InjectRepository(LeaderboardSnapshotEntity)
    public readonly repo: Repository<LeaderboardSnapshotEntity>,
  ) {}
}

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FollowEntity } from '@/modules/account/domain/Follow.entity';

@Injectable()
export class FollowRepository {
  public readonly repo: Repository<FollowEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(FollowEntity);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CheckInEntity } from '../../domain/CheckIn.entity';

@Injectable()
export class CheckInRepository {
  constructor(
    @InjectRepository(CheckInEntity)
    public readonly repo: Repository<CheckInEntity>,
  ) {}
}

export const CheckInRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(CheckInEntity).extend({});

export type CheckInRepositoryProvider = ReturnType<
  typeof CheckInRepositoryProvider
>;

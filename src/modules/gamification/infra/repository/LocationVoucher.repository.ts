import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, DataSource, Repository } from 'typeorm';
import { LocationVoucherEntity } from '@/modules/gamification/domain/LocationVoucher.entity';

@Injectable()
export class LocationVoucherRepository {
  constructor(
    @InjectRepository(LocationVoucherEntity)
    public readonly repo: Repository<LocationVoucherEntity>,
  ) {}
}


export const LocationVoucherRepositoryProvider = (
  dataSource: DataSource | EntityManager,
) => dataSource.getRepository(LocationVoucherEntity).extend({});

export type LocationVoucherRepositoryProvider = ReturnType<
  typeof LocationVoucherRepositoryProvider
>;
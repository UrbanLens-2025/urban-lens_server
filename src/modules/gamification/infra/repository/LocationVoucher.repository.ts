import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationVoucherEntity } from '@/modules/gamification/domain/LocationVoucher.entity';

@Injectable()
export class LocationVoucherRepository {
  constructor(
    @InjectRepository(LocationVoucherEntity)
    public readonly repo: Repository<LocationVoucherEntity>,
  ) {}
}

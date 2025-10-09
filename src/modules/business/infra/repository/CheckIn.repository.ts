import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckInEntity } from '../../domain/CheckIn.entity';

@Injectable()
export class CheckInRepository {
  constructor(
    @InjectRepository(CheckInEntity)
    public readonly repo: Repository<CheckInEntity>,
  ) {}
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticEntity } from '../../domain/Analytic.entity';

@Injectable()
export class AnalyticRepository {
  constructor(
    @InjectRepository(AnalyticEntity)
    public readonly repo: Repository<AnalyticEntity>,
  ) {}
}

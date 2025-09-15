import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FcmTokenEntity } from '@/modules/notification/domain/FcmToken.entity';

@Injectable()
export class FcmTokenRepository {
  constructor(
    @InjectRepository(FcmTokenEntity)
    private readonly repo: Repository<FcmTokenEntity>,
  ) {}
}

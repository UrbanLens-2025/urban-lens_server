import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PushNotificationEntity } from '@/modules/notification/domain/PushNotification.entity';

@Injectable()
export class PushNotificationRepository {
  constructor(
    @InjectRepository(PushNotificationEntity)
    public readonly repo: Repository<PushNotificationEntity>,
  ) {}
}

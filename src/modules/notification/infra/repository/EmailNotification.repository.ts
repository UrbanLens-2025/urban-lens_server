import { EmailNotificationEntity } from '@/modules/notification/domain/EmailNotification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailNotificationRepository {
  constructor(
    @InjectRepository(EmailNotificationEntity)
    public readonly repo: Repository<EmailNotificationEntity>,
  ) {}
}

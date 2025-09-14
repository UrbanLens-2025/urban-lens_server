import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '@/modules/auth/domain/User.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    public readonly repo: Repository<UserEntity>,
  ) {}
}

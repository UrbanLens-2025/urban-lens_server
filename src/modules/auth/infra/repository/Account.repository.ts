import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(AccountEntity)
    public readonly repo: Repository<AccountEntity>,
  ) {}
}

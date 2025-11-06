import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import { IUserProfileRepository } from './IUserProfile.repository';

@Injectable()
export class UserProfileRepository implements IUserProfileRepository {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepo: Repository<UserProfileEntity>,
  ) {}

  async findByAccountId(accountId: string): Promise<UserProfileEntity | null> {
    return this.userProfileRepo.findOne({
      where: { accountId },
    });
  }
}

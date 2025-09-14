import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/register.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { checkExist } from '@/common/utils/check-exist.util';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(user: RegisterDto): Promise<User> {
    return this.userRepository.save(user);
  }

  async checkUserExists(email: string): Promise<boolean> {
    return checkExist(this.userRepository, { email });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phoneNumber',
        'role',
        'password',
      ],
    });
  }
}

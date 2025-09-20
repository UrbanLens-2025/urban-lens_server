import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '@/modules/auth/infra/repository/User.repository';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CoreService } from '@/common/core/Core.service';
import { UpdateUserDto } from '@/common/dto/auth/UpdateUser.dto';
import { UserResponse } from '@/common/dto/auth/UserResponse.dto';
import { OnboardUser } from '@/common/dto/auth/Onboarding.dto';
import { UpdateResult } from 'typeorm';

@Injectable()
export class UserService extends CoreService {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  // TODO: Finish onboarding flow
  async onboardUser(
    userId: string,
    dto: OnboardUser.DTO,
  ): Promise<UpdateResult> {
    const user = await this.userRepository.repo.findOneByOrFail({ id: userId });

    if (user.hasOnboarded) {
      throw new BadRequestException('User has already onboarded');
    }

    Object.assign(user, dto);

    user.hasOnboarded = true;

    return await this.userRepository.repo.update({ id: user.id }, user);
  }

  async getUser(dto: JwtTokenDto): Promise<UserResponse.Dto> {
    const user = await this.userRepository.repo.findOneBy({
      id: dto.sub,
    });
    return this.mapTo(UserResponse.Dto, user);
  }

  async updateUser(userDto: JwtTokenDto, dto: UpdateUserDto) {
    const user = await this.userRepository.repo.findOneBy({
      id: userDto.sub,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = Object.assign(user, dto);

    return this.userRepository.repo.update({ id: user.id }, updatedUser);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@/modules/auth/infra/repository/User.repository';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CoreService } from '@/common/core/Core.service';
import { UserResponseDto } from '@/common/dto/auth/UserResponse.dto';
import { UpdateUserDto } from '@/common/dto/auth/UpdateUser.dto';

@Injectable()
export class UserService extends CoreService {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async getUser(dto: JwtTokenDto): Promise<UserResponseDto> {
    const user = await this.userRepository.repo.findOneBy({
      id: dto.sub,
    });
    return this.mapTo(UserResponseDto, user);
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

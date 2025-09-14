import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from '@/common/dto/auth/register.dto';
import { TokenService } from './token.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '@/common/dto/auth/login.dto';
import { UserRepository } from '@/modules/auth/domain/repository/User.repository';
import { UserResponseDto } from '@/common/dto/auth/UserResponse.dto';
import { CoreService } from '@/common/core/Core.service';

@Injectable()
export class AuthService extends CoreService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {
    super();
  }

  async register(createAuthDto: RegisterDto): Promise<UserResponseDto> {
    const userExists = await this.userRepository.repo.existsBy({
      email: createAuthDto.email,
    });
    if (userExists) {
      throw new BadRequestException('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createAuthDto.password, salt);
    const user = await this.userRepository.repo.save({
      ...createAuthDto,
      password: hashedPassword,
    });

    const response = this.mapTo(UserResponseDto, user);
    response.token = await this.tokenService.generateToken(user);
    return response;
  }

  async login(loginDto: LoginDto): Promise<UserResponseDto> {
    const user = await this.userRepository.repo.findOneBy({
      email: loginDto.email,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const response = this.mapTo(UserResponseDto, user);

    response.token = await this.tokenService.generateToken(user);
    return response;
  }
}

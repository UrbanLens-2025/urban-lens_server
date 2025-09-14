import { BadRequestException, Injectable } from '@nestjs/common';

import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { TokenService } from './services/token.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}
  async register(createAuthDto: RegisterDto) {
    const userExists = await this.userService.checkUserExists(
      createAuthDto.email,
    );
    if (userExists) {
      throw new BadRequestException('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createAuthDto.password, salt);
    const user = await this.userService.createUser({
      ...createAuthDto,
      password: hashedPassword,
    });

    const token = await this.tokenService.generateToken(user);
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.getUserByEmail(loginDto.email);
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
    const token = await this.tokenService.generateToken(user);
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      token,
    };
  }
}

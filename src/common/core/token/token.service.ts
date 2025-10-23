import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(user: Partial<AccountEntity>): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      } satisfies Partial<JwtTokenDto>,
      {
        expiresIn: '365 days', // Token expiration time
      },
    );
  }

  async verifyToken(token: string): Promise<JwtTokenDto> {
    return plainToInstance(
      JwtTokenDto,
      await this.jwtService.verifyAsync(token),
    );
  }
}

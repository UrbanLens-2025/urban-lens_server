import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { TokenService } from './services/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtService],
})
export class AuthModule {}

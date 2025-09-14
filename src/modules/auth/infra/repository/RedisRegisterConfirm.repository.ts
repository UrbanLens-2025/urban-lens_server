import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { RegisterDto } from '@/common/dto/auth/register.dto';

@Injectable()
export class RedisRegisterConfirmRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private static readonly REGISTER_CONFIRM_KEY = 'register:confirm:';
  private static readonly REGISTER_EXPIRATION = 60 * 5; // 5 minutes

  async set(dto: RegisterDto, confirmCode: string, otpCode: string) {
    await this.redis.setex(
      RedisRegisterConfirmRepository.REGISTER_CONFIRM_KEY.concat(dto.email)
        .concat(':')
        .concat(confirmCode)
        .concat(':')
        .concat(otpCode),
      RedisRegisterConfirmRepository.REGISTER_EXPIRATION,
      JSON.stringify(dto),
    );
  }

  async getAndDel(email: string, confirmCode: string, otpCode: string) {
    const key = RedisRegisterConfirmRepository.REGISTER_CONFIRM_KEY.concat(email)
      .concat(':')
      .concat(confirmCode)
      .concat(':')
      .concat(otpCode);
    const data = await this.redis.get(
      key
    );

    if (!data) {
      return null;
    }

    await this.redis.del(key);

    return JSON.parse(data) as RegisterDto;
  }

  getExpirationS(): number {
    return RedisRegisterConfirmRepository.REGISTER_EXPIRATION;
  }
}

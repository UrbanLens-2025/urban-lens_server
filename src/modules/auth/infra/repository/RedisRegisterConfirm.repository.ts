import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { RegisterDto } from '@/common/dto/auth/Register.dto';

@Injectable()
export class RedisRegisterConfirmRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private static readonly REGISTER_CONFIRM_KEY = 'register:confirm:';
  private static readonly REGISTER_EXPIRATION = 60 * 5; // 5 minutes

  static getExpirationS(): number {
    return RedisRegisterConfirmRepository.REGISTER_EXPIRATION;
  }

  async set(
    dto: RegisterDto,
    confirmCode: string,
    otpCode: string,
  ): Promise<boolean> {
    const res = await this.redis.setex(
      RedisRegisterConfirmRepository.REGISTER_CONFIRM_KEY.concat(dto.email),
      RedisRegisterConfirmRepository.REGISTER_EXPIRATION,
      JSON.stringify({
        ...dto,
        confirmCode,
        otpCode,
      }),
    );

    return res === 'OK';
  }

  async getByEmail(
    email: string,
  ): Promise<(RegisterDto & { confirmCode: string; otpCode: string }) | null> {
    const key =
      RedisRegisterConfirmRepository.REGISTER_CONFIRM_KEY.concat(email);
    const dataJson = await this.redis.get(key);

    if (!dataJson) return null;

    return JSON.parse(dataJson) as RegisterDto & {
      confirmCode: string;
      otpCode: string;
    };
  }

  async getAndValidate(
    email: string,
    confirmCode: string,
    otpCode: string,
  ): Promise<RegisterDto | null> {
    const key =
      RedisRegisterConfirmRepository.REGISTER_CONFIRM_KEY.concat(email);
    const dataJson = await this.redis.get(key);

    if (!dataJson) return null;

    const data = JSON.parse(dataJson) as RegisterDto & {
      confirmCode: string;
      otpCode: string;
    };

    if (data.confirmCode !== confirmCode || data.otpCode !== otpCode) {
      return null;
    }

    await this.redis.del(key);

    return data;
  }

  async delete(email: string): Promise<void> {
    const key =
      RedisRegisterConfirmRepository.REGISTER_CONFIRM_KEY.concat(email);
    await this.redis.del(key);
  }
}

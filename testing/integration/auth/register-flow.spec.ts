import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestingApp } from '../app.factory';
import { Role } from '@/common/constants/Role.constant';
import { RedisRegisterConfirmRepository } from '@/modules/auth/infra/repository/RedisRegisterConfirm.repository';

function randomEmail(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `itest_${rand}@example.com`;
}

describe('Auth integration: register, confirm, login', () => {
  let app: INestApplication;
  let redisRegisterRepo: RedisRegisterConfirmRepository;

  const password = 'Password!123';
  const email = randomEmail();
  const firstName = 'TestFirst';
  const lastName = 'TestLast';
  const phoneNumber = '+84901234567';

  beforeAll(async () => {
    app = await createTestingApp();
    redisRegisterRepo = app.get(RedisRegisterConfirmRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  it('register -> returns confirmCode', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/public/auth/register/user')
      .send({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role: Role.USER,
      })
      .expect(201);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('confirmCode');
  });

  it('register confirm -> creates account and returns token', async () => {
    // Overwrite OTP in Redis to a known value to complete confirmation flow
    const knownOtp = '1234';

    // Get last confirmCode by re-registering to receive the code again (same email)
    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/public/auth/register/user')
      .send({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role: Role.USER,
      })
      .expect(201);

    const confirmCode: string = registerRes.body?.data?.confirmCode;
    expect(typeof confirmCode).toBe('string');

    // Overwrite the OTP/confirm payload so we know the otp to use
    await redisRegisterRepo.set(
      {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role: Role.USER,
      },
      confirmCode,
      knownOtp,
    );

    const confirmRes = await request(app.getHttpServer())
      .post('/api/v1/public/auth/register/confirm')
      .send({ email, confirmCode, otpCode: knownOtp })
      .expect(201);

    expect(confirmRes.body).toHaveProperty('data');
    expect(confirmRes.body.data).toHaveProperty('token');
    expect(confirmRes.body.data).toHaveProperty('user');
    expect(confirmRes.body.data.user).toHaveProperty('email', email);
  });

  it('login -> returns token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/public/auth/login')
      .send({ email, password })
      .expect(201);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('token');
  });
});

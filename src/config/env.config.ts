import * as joi from 'joi';

export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;

  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  DATABASE_ENABLE_SYNC: boolean;

  MAILER_HOST: string;
  MAILER_PORT: number;
  MAILER_SECURE: boolean;
  MAILER_USERNAME: string;
  MAILER_PASSWORD: string;

  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;

  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

export const envConfig = joi.object<Environment>({
  NODE_ENV: joi
    .string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: joi.number().default(3000),

  DATABASE_HOST: joi.string().required(),
  DATABASE_PORT: joi.number().required(),
  DATABASE_USER: joi.string().required(),
  DATABASE_PASSWORD: joi.string().required(),
  DATABASE_NAME: joi.string().required(),
  DATABASE_ENABLE_SYNC: joi.boolean().default(false),

  MAILER_HOST: joi.string().required(),
  MAILER_PORT: joi.number().required(),
  MAILER_SECURE: joi.boolean().default(false),
  MAILER_USERNAME: joi.string().required(),
  MAILER_PASSWORD: joi.string().required(),

  REDIS_HOST: joi.string().required(),
  REDIS_PORT: joi.number().required(),
  REDIS_PASSWORD: joi.string(),

  JWT_SECRET: joi.string().required(),
  JWT_EXPIRES_IN: joi.string().required(),
});

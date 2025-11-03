import * as joi from 'joi';

export interface Environment {
  RUNTIME_VERSION: string;
  DEPLOYED_AT: string;

  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  ENABLE_ACCOUNT_SEEDING: boolean;
  ENABLE_WALLET_SEEDING: boolean;

  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  DATABASE_ENABLE_SYNC: boolean;
  DATABASE_SCHEMA: string;

  MAILER_HOST: string;
  MAILER_PORT: number;
  MAILER_SECURE: boolean;
  MAILER_USERNAME: string;
  MAILER_PASSWORD: string;

  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_URL: string;

  RABBITMQ_URL?: string;
  RABBITMQ_QUEUE?: string;

  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;

  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;

  R2_ENDPOINT: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_PUBLIC_BUCKET_NAME: string;
  R2_PUBLIC_DEVELOPMENT_URL: string;

  VNPAY_TMN_CODE: string;
  VNPAY_HASH_SECRET: string;
  VNPAY_URL: string;

  MAX_PENDING_DEPOSIT_TRANSACTIONS: number;
  MAX_PENDING_EVENT_REQUESTS: number;
  PAYMENT_EXPIRATION_MINUTES: number;

  PAYMENT_MOCK_HASH: string;
  PAYMENT_ALLOW_MOCK_HASH: boolean;
}

export const envConfig = joi.object<Environment>({
  RUNTIME_VERSION: joi.string().default('dev-local'),
  DEPLOYED_AT: joi.string().default('N/A'),

  NODE_ENV: joi
    .string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: joi.number().default(3000),
  ENABLE_ACCOUNT_SEEDING: joi.boolean().default(false),
  ENABLE_WALLET_SEEDING: joi.boolean().default(false),

  DATABASE_HOST: joi.string().required(),
  DATABASE_PORT: joi.number().required(),
  DATABASE_USER: joi.string().required(),
  DATABASE_PASSWORD: joi.string().required(),
  DATABASE_NAME: joi.string().required(),
  DATABASE_ENABLE_SYNC: joi.boolean().default(false),
  DATABASE_SCHEMA: joi.string().default('public'),

  MAILER_HOST: joi.string().required(),
  MAILER_PORT: joi.number().required(),
  MAILER_SECURE: joi.boolean().default(false),
  MAILER_USERNAME: joi.string().required(),
  MAILER_PASSWORD: joi.string().required(),

  REDIS_HOST: joi.string().required(),
  REDIS_PORT: joi.number().required(),
  REDIS_PASSWORD: joi.string(),
  REDIS_URL: joi.string().required(),

  RABBITMQ_URL: joi.string().optional(),
  RABBITMQ_QUEUE: joi.string().default('urban-lens'),

  JWT_SECRET: joi.string().required(),
  JWT_EXPIRES_IN: joi.string().required(),

  FIREBASE_PROJECT_ID: joi.string().required(),
  FIREBASE_CLIENT_EMAIL: joi.string().required(),
  FIREBASE_PRIVATE_KEY: joi.string().required(),

  R2_ENDPOINT: joi.string().required(),
  R2_ACCESS_KEY_ID: joi.string().required(),
  R2_SECRET_ACCESS_KEY: joi.string().required(),
  R2_PUBLIC_BUCKET_NAME: joi.string().required(),
  R2_PUBLIC_DEVELOPMENT_URL: joi.string().required(),

  VNPAY_TMN_CODE: joi.string().required(),
  VNPAY_HASH_SECRET: joi.string().required(),
  VNPAY_URL: joi.string().required(),

  MAX_PENDING_DEPOSIT_TRANSACTIONS: joi.number().default(5),
  MAX_PENDING_EVENT_REQUESTS: joi.number().default(10),
  PAYMENT_EXPIRATION_MINUTES: joi.number().default(10),
  PAYMENT_MOCK_HASH: joi
    .string()
    .default('MOCK_SECURE_HASH_FOR_TESTING_PURPOSES'),
  PAYMENT_ALLOW_MOCK_HASH: joi.boolean().default(false),
});

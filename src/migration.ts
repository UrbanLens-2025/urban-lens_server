import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import path from 'path';

dotenv.config({ path: '.env.development' });

/**
 * THIS IS FOR RUNNING MIGRATIONS ONLY
 * DO NOT USE IN CODE
 * @deprecated USE THE INJECTED DATASOURCE INSTEAD
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  schema: process.env.DATABASE_SCHEMA,
  entities: [path.join(__dirname, '../**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, '../../**/db/migrations/*.{ts,js}')],
  synchronize: false,
  logging: true,
});

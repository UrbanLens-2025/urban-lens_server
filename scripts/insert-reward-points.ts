import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from 'pg';
import { readFileSync } from 'fs';

// Load environment variables
config({ path: resolve(__dirname, '../.env.development') });

async function insertRewardPoints() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'urban_lens_dev',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    console.log(`   Host: ${process.env.DATABASE_HOST}`);
    console.log(`   Database: ${process.env.DATABASE_NAME}`);
    console.log(`   Schema: ${process.env.DATABASE_SCHEMA || 'development'}`);

    const schema = process.env.DATABASE_SCHEMA || 'development';

    // Read SQL file
    const sqlFile = resolve(__dirname, '../db/insert-reward-points.sql');
    let sql = readFileSync(sqlFile, 'utf-8');

    // Replace schema name
    sql = sql.replace(/development\.reward_points/g, `${schema}.reward_points`);

    console.log('\n📦 Inserting reward points...');

    // Execute SQL
    const result = await client.query(sql);

    console.log('✅ Reward points inserted successfully!');
    console.log('\n📊 Current reward points:');

    // Query to verify
    const verifyResult = await client.query(
      `SELECT type, points FROM ${schema}.reward_points ORDER BY type`,
    );

    if (verifyResult.rows.length > 0) {
      console.table(verifyResult.rows);
    } else {
      console.log('   No reward points found');
    }

    await client.end();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error inserting reward points:', error);
    await client.end();
    process.exit(1);
  }
}

// Run the script
insertRewardPoints();

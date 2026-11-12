const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

async function connectPostgres() {
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
  console.log('✅ PostgreSQL conectado');
}

module.exports = { pool, connectPostgres };

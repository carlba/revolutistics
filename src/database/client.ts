import pg from 'pg';

import { config } from '../config.js';

const { Pool } = pg;

export const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected database pool error', err);
});

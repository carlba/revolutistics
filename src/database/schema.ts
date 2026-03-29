import { pool } from './client.js';

export async function runMigrations(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id           VARCHAR PRIMARY KEY,
      type         VARCHAR        NOT NULL,
      state        VARCHAR        NOT NULL,
      created_at   TIMESTAMPTZ    NOT NULL,
      updated_at   TIMESTAMPTZ    NOT NULL,
      completed_at TIMESTAMPTZ,
      reference    TEXT,
      legs         JSONB          NOT NULL DEFAULT '[]',
      merchant     JSONB,
      raw_data     JSONB          NOT NULL,
      synced_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `);
  console.log('Database migrations applied successfully');
}

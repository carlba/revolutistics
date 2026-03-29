import { Router } from 'express';

import { pool } from '../database/client.js';

export const transactionsRouter = Router();

transactionsRouter.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query<{
      id: string;
      type: string;
      state: string;
      created_at: Date;
      updated_at: Date;
      completed_at: Date | null;
      reference: string | null;
      legs: unknown;
      merchant: unknown;
      synced_at: Date;
    }>(
      `SELECT id, type, state, created_at, updated_at, completed_at,
              reference, legs, merchant, synced_at
       FROM transactions
       ORDER BY created_at DESC
       LIMIT 500`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

transactionsRouter.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query<{ raw_data: unknown }>(
      `SELECT raw_data FROM transactions WHERE id = $1`,
      [req.params['id']]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(rows[0].raw_data);
  } catch (err) {
    console.error('Error fetching transaction:', err);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

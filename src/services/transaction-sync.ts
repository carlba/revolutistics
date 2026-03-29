import { pool } from '../database/client.js';
import type { RevolutTransaction } from '../revolut/types.js';
import { RevolutClient } from '../revolut/client.js';
import { config } from '../config.js';

let syncTimer: NodeJS.Timeout | null = null;

async function upsertTransactions(transactions: RevolutTransaction[]): Promise<void> {
  if (transactions.length === 0) return;

  const values: unknown[] = [];
  const placeholders = transactions.map((tx, i) => {
    const base = i * 10;
    values.push(
      tx.id,
      tx.type,
      tx.state,
      tx.created_at,
      tx.updated_at,
      tx.completed_at ?? null,
      tx.reference ?? null,
      JSON.stringify(tx.legs),
      tx.merchant ? JSON.stringify(tx.merchant) : null,
      JSON.stringify(tx)
    );
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10})`;
  });

  await pool.query(
    `INSERT INTO transactions
       (id, type, state, created_at, updated_at, completed_at, reference, legs, merchant, raw_data)
     VALUES ${placeholders.join(', ')}
     ON CONFLICT (id) DO UPDATE SET
       state        = EXCLUDED.state,
       updated_at   = EXCLUDED.updated_at,
       completed_at = EXCLUDED.completed_at,
       reference    = EXCLUDED.reference,
       legs         = EXCLUDED.legs,
       merchant     = EXCLUDED.merchant,
       raw_data     = EXCLUDED.raw_data,
       synced_at    = NOW()`,
    values
  );
}

export async function syncTransactions(): Promise<void> {
  const client = new RevolutClient(
    config.revolut.apiBaseUrl,
    config.revolut.accessToken
  );

  const from = new Date();
  from.setDate(from.getDate() - config.sync.transactionLookbackDays);

  try {
    console.log(
      `[sync] Fetching transactions from ${from.toISOString()} to now...`
    );
    const transactions = await client.getTransactions({ from });
    console.log(`[sync] Fetched ${transactions.length} transactions`);
    await upsertTransactions(transactions);
    console.log(`[sync] Upserted ${transactions.length} transactions`);
  } catch (err) {
    console.error('[sync] Error syncing transactions:', err);
  }
}

export function startSyncService(): void {
  const intervalMs = config.sync.intervalSeconds * 1000;
  console.log(
    `[sync] Starting transaction sync every ${config.sync.intervalSeconds}s`
  );

  void syncTransactions();

  syncTimer = setInterval(() => {
    void syncTransactions();
  }, intervalMs);
}

export function stopSyncService(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

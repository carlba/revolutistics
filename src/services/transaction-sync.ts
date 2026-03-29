import { Prisma } from '@prisma/client';

import { prisma } from '../database/client.js';
import type { RevolutTransaction } from '../revolut/types.js';
import { RevolutClient } from '../revolut/client.js';
import { config } from '../config.js';

let syncTimer: NodeJS.Timeout | null = null;

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function toNullableJson(value: unknown): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  return value == null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}

async function upsertTransactions(transactions: RevolutTransaction[]): Promise<void> {
  if (transactions.length === 0) return;

  await prisma.$transaction(
    transactions.map(tx =>
      prisma.transaction.upsert({
        where: { id: tx.id },
        create: {
          id: tx.id,
          type: tx.type,
          state: tx.state,
          createdAt: new Date(tx.created_at),
          updatedAt: new Date(tx.updated_at),
          completedAt: tx.completed_at ? new Date(tx.completed_at) : null,
          reference: tx.reference ?? null,
          legs: toJson(tx.legs),
          merchant: toNullableJson(tx.merchant),
          rawData: toJson(tx),
        },
        update: {
          state: tx.state,
          updatedAt: new Date(tx.updated_at),
          completedAt: tx.completed_at ? new Date(tx.completed_at) : null,
          reference: tx.reference ?? null,
          legs: toJson(tx.legs),
          merchant: toNullableJson(tx.merchant),
          rawData: toJson(tx),
          syncedAt: new Date(),
        },
      })
    )
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

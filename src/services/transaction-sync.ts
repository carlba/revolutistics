import { Prisma } from '@prisma/client';

import { prisma } from '../database/client.js';
import type { OBTransaction } from '../revolut/types.js';
import { RevolutOpenBankingClient } from '../revolut/client.js';
import { config } from '../config.js';

let syncTimer: NodeJS.Timeout | null = null;

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function upsertTransactions(transactions: OBTransaction[]): Promise<void> {
  if (transactions.length === 0) return;

  await prisma.$transaction(
    transactions.map(tx =>
      prisma.transaction.upsert({
        where: { id: tx.TransactionId },
        create: {
          id: tx.TransactionId,
          accountId: tx.AccountId,
          transactionReference: tx.TransactionReference ?? null,
          amount: tx.Amount.Amount,
          currency: tx.Amount.Currency,
          creditDebitIndicator: tx.CreditDebitIndicator,
          status: tx.Status,
          bookingDateTime: new Date(tx.BookingDateTime),
          valueDateTime: tx.ValueDateTime ? new Date(tx.ValueDateTime) : null,
          transactionInformation: tx.TransactionInformation ?? null,
          rawData: toJson(tx),
        },
        update: {
          transactionReference: tx.TransactionReference ?? null,
          amount: tx.Amount.Amount,
          currency: tx.Amount.Currency,
          creditDebitIndicator: tx.CreditDebitIndicator,
          status: tx.Status,
          bookingDateTime: new Date(tx.BookingDateTime),
          valueDateTime: tx.ValueDateTime ? new Date(tx.ValueDateTime) : null,
          transactionInformation: tx.TransactionInformation ?? null,
          rawData: toJson(tx),
          syncedAt: new Date(),
        },
      })
    )
  );
}

export async function syncTransactions(): Promise<void> {
  const client = new RevolutOpenBankingClient(
    config.revolut.apiBaseUrl,
    config.revolut.tokenUrl,
    config.revolut.clientId,
    config.revolut.clientSecret,
    config.revolut.accessToken,
    config.revolut.refreshToken
  );

  const from = new Date();
  from.setDate(from.getDate() - config.sync.transactionLookbackDays);

  try {
    const accounts = await client.getAccounts();
    console.log(`[sync] Found ${accounts.length} account(s)`);

    for (const account of accounts) {
      console.log(
        `[sync] Fetching transactions for account ${account.AccountId} ` +
          `(${account.Currency}) from ${from.toISOString()}...`
      );
      const transactions = await client.getTransactions(account.AccountId, {
        fromBookingDateTime: from,
      });
      console.log(
        `[sync] Fetched ${transactions.length} transaction(s) for account ${account.AccountId}`
      );
      await upsertTransactions(transactions);
      console.log(
        `[sync] Upserted ${transactions.length} transaction(s) for account ${account.AccountId}`
      );
    }
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

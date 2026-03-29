import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

import { config } from './config.js';
import { prisma } from './database/client.js';
import { transactionsRouter } from './routes/transactions.js';
import { startSyncService } from './services/transaction-sync.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/transactions', transactionsRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function main(): Promise<void> {
  await prisma.$connect();
  console.log('Database connected');

  startSyncService();

  app.listen(config.port, () => {
    console.log(`Server listening on http://localhost:${config.port}`);
  });
}

main().catch(err => {
  console.error('Fatal error:', err);
  void prisma.$disconnect();
  process.exit(1);
});

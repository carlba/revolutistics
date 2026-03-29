import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { prisma } from '../database/client.js';

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

export const transactionsRouter = Router();
transactionsRouter.use(apiLimiter);

transactionsRouter.get('/', async (_req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: {
        id: true,
        type: true,
        state: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        reference: true,
        legs: true,
        merchant: true,
        syncedAt: true,
      },
    });
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

transactionsRouter.get('/:id', async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params['id'] },
      select: { rawData: true },
    });
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(transaction.rawData);
  } catch (err) {
    console.error('Error fetching transaction:', err);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

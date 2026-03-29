// config must be imported first so that DATABASE_URL is set before PrismaClient is instantiated
import '../config.js';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

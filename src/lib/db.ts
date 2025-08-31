// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'], // 需要调试时可加 'query'
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

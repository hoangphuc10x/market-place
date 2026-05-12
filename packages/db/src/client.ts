import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient. In dev with HMR, multiple instances would otherwise
 * be created on every reload and exhaust DB connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient } from '@prisma/client';

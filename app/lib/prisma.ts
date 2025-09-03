import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Gracefully close Prisma connection on exit
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;

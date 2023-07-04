import { PrismaClient } from '@prisma/client';

export type GraphQLContext = {
    prisma: PrismaClient;
};

const prisma = new PrismaClient({
    log:
        process.env.ENVIRONMENT === 'development'
            ? ['query', 'info', 'warn', 'error']
            : ['warn', 'error'],
});

export async function createContext(): Promise<GraphQLContext> {
    return {
        prisma,
    };
}

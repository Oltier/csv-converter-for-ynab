import { PrismaClient } from '../generated/client';

class DBClient {
  private readonly prisma: PrismaClient;
  private static instance: DBClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static isInitialized(): boolean {
    return !!DBClient.instance;
  }

  public static disconnect(): Promise<void> {
    if (DBClient.instance) {
      return DBClient.instance.prisma.$disconnect();
    }

    return Promise.resolve();
  }

  public static getInstance(): PrismaClient {
    if (!DBClient.instance) {
      DBClient.instance = new DBClient();
    }
    return DBClient.instance.prisma;
  }
}

export default DBClient;

// tests/setup.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock de Prisma pour tous les tests
jest.mock('../app/services/prismaService', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

// Récupération du mock
let prismaMock: DeepMockProxy<PrismaClient>;

beforeEach(() => {
  prismaMock = require('../app/services/prismaService').default;
  mockReset(prismaMock);
});

export { prismaMock };
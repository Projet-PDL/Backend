// Test setup file
// Mock environment variables for tests

/**
 * Unit Test Setup - NO DATABASE REQUIRED
 * All external services are mocked
 */

// Mock prismaService BEFORE any imports that might load it
jest.mock('../app/services/prismaService', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cV: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    experience: { create: jest.fn(), deleteMany: jest.fn() },
    education: { create: jest.fn(), deleteMany: jest.fn() },
    skill: { create: jest.fn(), deleteMany: jest.fn() },
    certification: { create: jest.fn(), deleteMany: jest.fn() },
    language: { create: jest.fn(), deleteMany: jest.fn() },
    interest: { create: jest.fn(), deleteMany: jest.fn() },
    profileInfo: { create: jest.fn(), deleteMany: jest.fn(), upsert: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn((callback) => callback({
      experience: { create: jest.fn(), deleteMany: jest.fn() },
      education: { create: jest.fn(), deleteMany: jest.fn() },
      skill: { create: jest.fn(), deleteMany: jest.fn() },
      certification: { create: jest.fn(), deleteMany: jest.fn() },
      language: { create: jest.fn(), deleteMany: jest.fn() },
      interest: { create: jest.fn(), deleteMany: jest.fn() },
      profileInfo: { upsert: jest.fn() },
    })),
  },
}));

// Mock redisService BEFORE any imports
jest.mock('../app/services/redisService', () => ({
  redisService: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    isRedisAvailable: jest.fn().mockReturnValue(false),
    close: jest.fn(),
  },
}));

// Now it's safe to set up other things
beforeEach(() => {
  jest.clearAllMocks();
});


process.env.BRIGHTDATA_API_KEY = 'test-api-key-12345';
process.env.FIREBASE_STORAGE_BUCKET = 'test-bucket.appspot.com';
process.env.JWT_SECRET = 'test-jwt-secret';
// Disable Redis for unit tests to prevent connection issues
process.env.REDIS_ENABLED = 'false';
// Set a dummy DATABASE_URL for unit tests (they mock prisma anyway)
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

// Global teardown to ensure all connections are closed
afterAll(async () => {
  // Give time for any pending operations to complete
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  // Try to close any open Redis connections
  try {
    const { redisService } = require('../app/services/redisService');
    if (redisService && typeof redisService.close === 'function') {
      await redisService.close();
    }
  } catch (error) {
    // Ignore errors - service might be mocked or not initialized
  }

  // Try to disconnect Prisma
  try {
    const prisma = require('../app/services/prismaService').default;
    if (prisma && typeof prisma.$disconnect === 'function') {
      await prisma.$disconnect();
    }
  } catch (error) {
    // Ignore errors - service might be mocked or not initialized
  }
});

/**
 * Integration Test Setup
 * Cleans up ONLY test data (emails ending with @test.com)
 */

import prisma from '../../app/services/prismaService';

/**
 * Clean up test database - ONLY test users and their data
 */
export async function cleanupDatabase(): Promise<void> {
  // Find test users (by test email pattern)
  const testUsers = await prisma.user.findMany({
    where: {
      email: { endsWith: '@test.com' },
    },
    select: { id: true },
  });

  const testUserIds = testUsers.map((u) => u.id);

  if (testUserIds.length === 0) return;

  // Find CVs belonging to test users
  const testCVs = await prisma.cV.findMany({
    where: { userId: { in: testUserIds } },
    select: { id: true },
  });

  const testCVIds = testCVs.map((cv) => cv.id);

  // Delete CV-related data for test CVs only
  if (testCVIds.length > 0) {
    await prisma.interest.deleteMany({ where: { cvId: { in: testCVIds } } });
    await prisma.language.deleteMany({ where: { cvId: { in: testCVIds } } });
    await prisma.certification.deleteMany({ where: { cvId: { in: testCVIds } } });
    await prisma.skill.deleteMany({ where: { cvId: { in: testCVIds } } });
    await prisma.education.deleteMany({ where: { cvId: { in: testCVIds } } });
    await prisma.experience.deleteMany({ where: { cvId: { in: testCVIds } } });
    await prisma.profileInfo.deleteMany({ where: { cvId: { in: testCVIds } } });
    await prisma.cV.deleteMany({ where: { id: { in: testCVIds } } });
  }

  // Delete test users
  await prisma.user.deleteMany({ where: { id: { in: testUserIds } } });
}

/**
 * Create a test user (use @test.com email so cleanup works)
 */
export async function createTestUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  // Ensure email ends with @test.com for cleanup
  if (!data.email.endsWith('@test.com')) {
    throw new Error('Test user email must end with @test.com');
  }

  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });
}

/**
 * Global setup
 */
export async function globalSetup(): Promise<void> {
  await prisma.$connect();
  await cleanupDatabase(); // Clean leftover test data
}

/**
 * Global teardown
 */
export async function globalTeardown(): Promise<void> {
  await cleanupDatabase();
  await prisma.$disconnect();
}
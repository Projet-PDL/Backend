/**
 * Standalone cleanup script for integration tests
 * Run this if tests crash and leave the database in a dirty state
 *
 * Usage: npx ts-node tests/integration/cleanup.ts
 */

import { cleanupDatabase, globalTeardown } from './setup';

async function main() {
  console.log('🧹 Running standalone integration test cleanup...');

  try {
    await cleanupDatabase();
    console.log('✅ Database cleaned successfully');

    await globalTeardown();
    console.log('✅ Cleanup complete');

    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

main();

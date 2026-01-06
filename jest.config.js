module.exports = {
  projects: [
    // Unit tests configuration - uses mocks
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/tests'],
      testMatch: ['<rootDir>/tests/*.test.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/integration/'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      // Reset modules between tests to ensure mocks work correctly
      resetModules: true,
    },
    // Integration tests configuration - uses real services
    {
      displayName: 'integration',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/tests/integration'],
      testMatch: ['<rootDir>/tests/integration/*.test.ts'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      // Integration tests don't use a separate setup file - they handle setup/teardown internally
      // Run integration tests sequentially
      maxWorkers: 1,
    },
  ],
  collectCoverageFrom: [
    'app/services/**/*.ts',
    '!app/services/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  // Force exit after tests complete to handle any lingering connections
  forceExit: true,
  // Detect open handles that prevent Jest from exiting
  detectOpenHandles: true,
  // Increase timeout for integration tests
  testTimeout: 30000,
};

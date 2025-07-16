/**
 * 🧪 Test Setup & Configuration
 * 
 * Global test setup for Vitest with database initialization and cleanup
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { DatabaseManager } from '../src/models.js';
import { rmSync, existsSync } from 'fs';

// Test database path
const TEST_DB_PATH = 'data/test.db';

// Global database instance for tests
let testDb = null;

beforeAll(async () => {
  // Clean up any existing test database
  if (existsSync(TEST_DB_PATH)) {
    rmSync(TEST_DB_PATH, { force: true });
  }
  
  // Initialize test database
  testDb = new DatabaseManager(TEST_DB_PATH, { verbose: false });
  await testDb.initialize();
  
  // Make db available globally for tests
  global.testDb = testDb;
});

afterAll(async () => {
  // Close database connection
  if (testDb && testDb.db) {
    testDb.close();
  }
  
  // Clean up test database file
  if (existsSync(TEST_DB_PATH)) {
    rmSync(TEST_DB_PATH, { force: true });
  }
});

beforeEach(async () => {
  // Clear all tables before each test
  if (testDb && testDb.db) {
    testDb.db.exec('DELETE FROM summaries');
    testDb.db.exec('DELETE FROM chunks');
  }
});

afterEach(() => {
  // Additional cleanup if needed
});

// Global test utilities
global.testUtils = {
  createMockChunk: (overrides = {}) => ({
    id: 'chunk_test_123',
    containerId: 'container_abc',
    content: 'Test log content\nSome important event\nError occurred',
    tsStart: new Date('2025-01-16T10:00:00Z'),
    tsEnd: new Date('2025-01-16T10:05:00Z'),
    sizeBytes: 150,
    ...overrides
  }),
  
  createMockSummary: (overrides = {}) => ({
    what_happened: 'Test event occurred',
    key_events: ['Log started', 'Error detected'],
    open_questions: ['Why did error occur?'],
    ...overrides
  })
}; 
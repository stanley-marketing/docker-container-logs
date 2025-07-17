/**
 * 🧪 Integration Test – Gemini Summariser + Database + Metrics
 */

import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { unlinkSync, existsSync } from 'fs';
import { DatabaseManager } from '../../src/models.js';
import { GeminiSummariser } from '../../src/summariser.js';
import { geminiTokensTotal, geminiCostUsdTotal, geminiRequestSeconds, metricsRegistry } from '../../src/metrics.js';

const TEST_DB = 'data/int-test.db';

let db;
let summariser;

beforeAll(async () => {
  if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  db = new DatabaseManager(TEST_DB);
  await db.initialize();
});

afterAll(() => {
  db.close();
  if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
});

afterEach(() => {
  // Reset metrics between tests
  metricsRegistry.resetMetrics();
  summariser?.removeAllListeners();
  summariser = null;

  // Clear DB tables to isolate each test
  if (db?.db) {
    db.db.exec('DELETE FROM summaries; DELETE FROM chunks;');
  }
});

it('should write rows to DB and increment Prometheus metrics', async () => {
  // Mock Gemini client
  const mockGeminiClient = {
    summariseChunk: vi.fn().mockResolvedValue({
      summary: {
        what_happened: 'Container started',
        key_events: ['Start'],
        open_questions: []
      },
      tokenUsage: {
        tokensIn: 20,
        tokensOut: 10,
        totalTokens: 30,
        costUsd: 0.00002
      },
      duration: 50
    })
  };

  summariser = new GeminiSummariser(mockGeminiClient, db, { consumer: { maxQueueSize: 10, processingDelay: 1 } });

  const processedPromise = new Promise((resolve) => summariser.on('processed', resolve));

  // Submit chunk
  summariser.submitChunk({
    chunkId: 'int-1',
    containerId: 'c1',
    content: 'log',
    sizeBytes: 50,
    tsStart: new Date().toISOString(),
    tsEnd: new Date().toISOString()
  });

  await processedPromise;

  // Assert DB rows
  const chunkCount = db.db.prepare('SELECT COUNT(*) as c FROM chunks').get().c;
  const summaryCount = db.db.prepare('SELECT COUNT(*) as c FROM summaries').get().c;
  expect(chunkCount).toBe(1);
  expect(summaryCount).toBe(1);

  // Assert metrics
  expect(geminiTokensTotal.hashMap[''].value).toBe(30);
  expect(geminiCostUsdTotal.hashMap[''].value).toBeCloseTo(0.00002);
  // Histogram count should be 1
  expect(geminiRequestSeconds.hashMap[''].count).toBe(1);
});

it('should retry Gemini call after 429 error and still insert summary', { timeout: 15000 }, async () => {
  // Create real GeminiClient instance but stub generateContent
  const { GeminiClient } = await import('../../src/gemini.js');

  const geminiClient = new GeminiClient('fake-api-key', { retry: { maxRetries: 1, baseDelayMs: 10, maxDelayMs: 20 } });

  // Stub generateContent to fail first, succeed second
  let callCount = 0;
  geminiClient.model.generateContent = vi.fn().mockImplementation(async () => {
    callCount += 1;
    if (callCount === 1) {
      throw new Error('Request failed with status 429');
    }
    return {
      response: {
        text() {
          return JSON.stringify({
            what_happened: 'Recovered after retry',
            key_events: ['Retry success'],
            open_questions: []
          });
        },
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5
        }
      }
    };
  });

  summariser = new GeminiSummariser(geminiClient, db, { consumer: { maxQueueSize: 10, processingDelay: 1 } });

  const processedPromise = new Promise((resolve) => summariser.on('processed', resolve));

  summariser.submitChunk({
    chunkId: 'retry-1',
    containerId: 'c2',
    content: 'error then success',
    sizeBytes: 50,
    tsStart: new Date().toISOString(),
    tsEnd: new Date().toISOString()
  });

  await processedPromise;

  // Ensure generateContent was called twice
  expect(geminiClient.model.generateContent).toHaveBeenCalledTimes(2);

  // DB should contain 1 chunk and 1 summary
  const chunkCount = db.db.prepare('SELECT COUNT(*) as c FROM chunks').get().c;
  const summaryCount = db.db.prepare('SELECT COUNT(*) as c FROM summaries').get().c;
  expect(chunkCount).toBe(1);
  expect(summaryCount).toBe(1);
}); 
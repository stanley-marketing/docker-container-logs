/**
 * 🧪 Tests for Gemini Summariser Worker
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChunkConsumer, GeminiSummariser } from '../src/summariser.js';

describe('ChunkConsumer', () => {
  let consumer;

  beforeEach(() => {
    consumer = new ChunkConsumer({ maxQueueSize: 5, processingDelay: 1 });
  });

  afterEach(() => {
    consumer?.clear();
  });

  it('should create consumer with correct settings', () => {
    expect(consumer.maxQueueSize).toBe(5);
    expect(consumer.processingDelay).toBe(1);
    expect(consumer.processing).toBe(false);
    expect(consumer.queue.length).toBe(0);
  });

  it('should enqueue chunks successfully', () => {
    const chunk = { chunkId: 'test-1', content: 'test log' };
    const result = consumer.enqueue(chunk);
    
    expect(result).toBe(true);
    expect(consumer.queue.length).toBe(1);
  });

  it('should reject chunks when queue is full', () => {
    // Fill queue to max capacity
    for (let i = 0; i < 5; i++) {
      consumer.enqueue({ chunkId: `test-${i}`, content: 'test' });
    }
    
    const result = consumer.enqueue({ chunkId: 'test-overflow', content: 'overflow' });
    expect(result).toBe(false);
    expect(consumer.queue.length).toBe(5);
  });

  it('should emit process events for queued chunks', async () => {
    const chunk = { chunkId: 'test-process', content: 'test' };
    const processPromise = new Promise((resolve) => {
      consumer.on('process', (processedChunk) => {
        resolve(processedChunk);
      });
    });

    consumer.enqueue(chunk);
    const processedChunk = await processPromise;
    
    expect(processedChunk.chunkId).toBe('test-process');
  });

  it('should respect processing delay for hand-off performance', async () => {
    const chunk = { chunkId: 'test-timing', content: 'test' };
    const startTime = Date.now();
    
    const processPromise = new Promise((resolve) => {
      consumer.on('process', () => {
        const elapsed = Date.now() - startTime;
        resolve(elapsed);
      });
    });

    consumer.enqueue(chunk);
    const elapsed = await processPromise;
    
    // Should be at least the processing delay (1ms in test)
    expect(elapsed).toBeGreaterThanOrEqual(1);
  });

  it('should provide accurate status information', () => {
    consumer.enqueue({ chunkId: 'test-1', content: 'test' });
    consumer.enqueue({ chunkId: 'test-2', content: 'test' });
    
    const status = consumer.getStatus();
    expect(status.queueSize).toBe(2);
    expect(status.maxQueueSize).toBe(5);
    // Processing flag may be false initially due to setTimeout(0)
    expect(typeof status.processing).toBe('boolean');
  });

  it('should clear queue properly', () => {
    consumer.enqueue({ chunkId: 'test-1', content: 'test' });
    consumer.enqueue({ chunkId: 'test-2', content: 'test' });
    
    const cleared = consumer.clear();
    expect(cleared).toBe(2);
    expect(consumer.queue.length).toBe(0);
  });
});

describe('GeminiSummariser', () => {
  let summariser;
  let mockGeminiClient;
  let mockDatabase;

  beforeEach(() => {
    mockGeminiClient = {
      summariseChunk: vi.fn()
    };
    mockDatabase = {
      query: vi.fn(),
      prepare: vi.fn()
    };
    
    summariser = new GeminiSummariser(mockGeminiClient, mockDatabase, {
      maxFailures: 3,
      consumer: { maxQueueSize: 5, processingDelay: 1 }
    });
  });

  afterEach(() => {
    summariser?.stop();
  });

  it('should create summariser with correct configuration', () => {
    expect(summariser.geminiClient).toBe(mockGeminiClient);
    expect(summariser.database).toBe(mockDatabase);
    expect(summariser.circuitBreaker.maxFailures).toBe(3);
  });

  it('should submit chunks when circuit breaker is closed', () => {
    const chunk = { chunkId: 'test-submit', content: 'test log' };
    const result = summariser.submitChunk(chunk);
    
    expect(result).toBe(true);
  });

  it('should reject chunks when circuit breaker is open', () => {
    // Force circuit breaker open
    summariser.circuitBreaker.isOpen = true;
    
    const chunk = { chunkId: 'test-reject', content: 'test log' };
    const result = summariser.submitChunk(chunk);
    
    expect(result).toBe(false);
  });

  it('should open circuit breaker after max failures', () => {
    // Simulate failures
    for (let i = 0; i < 3; i++) {
      summariser._handleFailure(new Error('Test failure'));
    }
    
    expect(summariser.circuitBreaker.isOpen).toBe(true);
    expect(summariser.circuitBreaker.failures).toBe(3);
  });

  it('should provide health status', () => {
    const health = summariser.getHealth();
    
    expect(health.status).toBe('healthy');
    expect(health.circuitBreaker).toBeDefined();
    expect(health.queue).toBeDefined();
  });

  it('should report unhealthy when circuit breaker is open', () => {
    summariser.circuitBreaker.isOpen = true;
    
    const health = summariser.getHealth();
    expect(health.status).toBe('summariser_unhealthy');
  });

  it('should emit started event when started', () => {
    const startedPromise = new Promise((resolve) => {
      summariser.on('started', resolve);
    });

    summariser.start();
    return expect(startedPromise).resolves.toBeUndefined();
  });

  it('should emit stopped event when stopped', () => {
    const stoppedPromise = new Promise((resolve) => {
      summariser.on('stopped', resolve);
    });

    summariser.stop();
    return expect(stoppedPromise).resolves.toBeUndefined();
  });

  it('should process chunk through Gemini and emit processed event', async () => {
    const chunk = { chunkId: 'test-gemini', content: 'test log' };
    const mockResult = {
      summary: {
        what_happened: 'Test summary',
        key_events: ['Event 1'],
        open_questions: ['Question 1']
      },
      tokenUsage: {
        tokensIn: 50,
        tokensOut: 25,
        totalTokens: 75,
        costUsd: 0.001
      },
      duration: 500
    };

    mockGeminiClient.summariseChunk.mockResolvedValue(mockResult);

    const processedPromise = new Promise((resolve) => {
      summariser.on('processed', resolve);
    });

    summariser.submitChunk(chunk);
    const processedResult = await processedPromise;

    expect(processedResult.chunkId).toBe('test-gemini');
    expect(processedResult.summary).toEqual(mockResult.summary);
    expect(processedResult.tokenUsage).toEqual(mockResult.tokenUsage);
    expect(mockGeminiClient.summariseChunk).toHaveBeenCalledWith(chunk);
  });

  it('should reset circuit breaker failures on successful processing', async () => {
    const chunk = { chunkId: 'test-success', content: 'test' };
    const mockResult = {
      summary: { what_happened: 'Success', key_events: [], open_questions: [] },
      tokenUsage: { tokensIn: 10, tokensOut: 5, totalTokens: 15, costUsd: 0.0001 },
      duration: 100
    };

    mockGeminiClient.summariseChunk.mockResolvedValue(mockResult);

    // Set some failures first
    summariser.circuitBreaker.failures = 2;

    const processedPromise = new Promise((resolve) => {
      summariser.on('processed', resolve);
    });

    summariser.submitChunk(chunk);
    await processedPromise;

    expect(summariser.circuitBreaker.failures).toBe(0);
  });
}); 
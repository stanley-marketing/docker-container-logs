/**
 * 🧪 Tests for Docker Log Collector & Chunker
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Chunker, LogCollector } from '../src/collector.js';
import { logLinesTotal } from '../src/metrics.js';

describe('Chunker', () => {
  let chunker;

  beforeEach(() => {
    chunker = new Chunker('test-container', 1000, 50); // 1s, 50 bytes for testing
    // Reset logLinesTotal counter before each test
    if (logLinesTotal && logLinesTotal.reset) logLinesTotal.reset();
  });

  afterEach(() => {
    chunker?.destroy();
  });

  it('should create chunker with correct settings', () => {
    expect(chunker.containerId).toBe('test-container');
    expect(chunker.maxAge).toBe(1000);
    expect(chunker.maxSize).toBe(50);
    expect(chunker.sizeBytes).toBe(0);
  });

  it('should flush chunk when size limit is reached', () => {
    // Use X instead of A to avoid hex redaction
    const longLine = 'X'.repeat(60) + '\n';
    const chunk = chunker.feed(longLine);
    
    expect(chunk).toBeTruthy();
    expect(chunk.containerId).toBe('test-container');
    expect(chunk.sizeBytes).toBeGreaterThan(50);
    expect(chunk.reason).toBe('size');
    expect(chunker.sizeBytes).toBe(0); // Should reset after flush
  });

  it('should redact secrets in log lines', () => {
    const lineWithSecret = 'AWS Key: AKIAIOSFODNN7EXAMPLE and hex: 1234567890abcdef\n';
    chunker.feed(lineWithSecret);
    
    expect(chunker.buffer).toContain('**REDACTED**');
    expect(chunker.buffer).not.toContain('AKIAIOSFODNN7EXAMPLE');
    expect(chunker.buffer).not.toContain('1234567890abcdef');
  });

  it('should emit chunk event when flushed', async () => {
    const chunkPromise = new Promise((resolve) => {
      chunker.on('chunk', (chunk) => {
        resolve(chunk);
      });
    });
    
    chunker.feed('test line\n');
    chunker._flush('manual');
    
    const chunk = await chunkPromise;
    expect(chunk.chunkId).toBe('test-container-1');
    expect(chunk.content).toBe('test line\n');
  });

  it('should not flush empty buffer', () => {
    const chunk = chunker._flush('manual');
    expect(chunk).toBeNull();
  });

  it('should increment logLinesTotal counter for each ingested line', () => {
    const initial = logLinesTotal.hashMap['']?.value || 0;
    chunker.feed('line 1\n');
    chunker.feed('line 2\n');
    const after = logLinesTotal.hashMap['']?.value || 0;
    expect(after - initial).toBe(2);
  });

  // Performance test for AC 9 - 2000 lines per second
  it('should handle 2000 lines per second performance requirement', () => {
    const performanceChunker = new Chunker('perf-test', 30000, 8192);
    const testLine = 'This is a typical log line that might be seen in production logs\n';
    const targetLinesPerSecond = 2000;
    const testDurationMs = 500; // Test for 500ms
    const expectedLines = Math.floor((targetLinesPerSecond * testDurationMs) / 1000);
    
    const startTime = process.hrtime.bigint();
    let processedLines = 0;
    
    // Process expected number of lines
    for (let i = 0; i < expectedLines; i++) {
      performanceChunker.feed(testLine);
      processedLines++;
    }
    
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;
    const actualLinesPerSecond = (processedLines / durationMs) * 1000;
    
    // Should process at least the target rate
    expect(actualLinesPerSecond).toBeGreaterThanOrEqual(targetLinesPerSecond);
    expect(processedLines).toBe(expectedLines);
    
    performanceChunker.destroy();
  });
});

describe('LogCollector', () => {
  let collector;
  let mockDocker;

  beforeEach(() => {
    // Mock dockerode
    mockDocker = {
      listContainers: vi.fn().mockResolvedValue([
        {
          Id: 'container123456789',
          Names: ['/test-container'],
          State: 'running'
        }
      ]),
      getContainer: vi.fn().mockReturnValue({
        logs: vi.fn().mockResolvedValue({
          on: vi.fn(),
          pipe: vi.fn()
        })
      })
    };

    collector = new LogCollector({ docker: mockDocker });
  });

  afterEach(async () => {
    if (collector.running) {
      await collector.stop();
    }
  });

  it('should create collector with default options', () => {
    expect(collector.running).toBe(false);
    expect(collector.chunkers.size).toBe(0);
    expect(collector.containers.size).toBe(0);
  });

  it('should discover containers', async () => {
    collector.docker = mockDocker;
    const containers = await collector._discoverContainers({ all: true });
    
    expect(mockDocker.listContainers).toHaveBeenCalledWith({
      all: false // Only running containers
    });
    expect(containers).toHaveLength(1);
    expect(containers[0].Names[0]).toBe('/test-container');
  });

  it('should not allow starting twice', async () => {
    collector.running = true;
    
    await expect(collector.start()).rejects.toThrow('LogCollector is already running');
  });

  it('should handle container discovery with labels', async () => {
    collector.docker = mockDocker;
    await collector._discoverContainers({ labels: { app: 'web' } });
    
    expect(mockDocker.listContainers).toHaveBeenCalledWith({
      all: false,
      filters: { label: ['app=web'] }
    });
  });
}); 
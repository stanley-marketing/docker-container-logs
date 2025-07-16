/**
 * 🧪 Tests for Gemini AI Client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeminiClient } from '../src/gemini.js';

// Mock the Google Generative AI package
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn()
    })
  }))
}));

describe('GeminiClient', () => {
  let client;
  let mockModel;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create client
    client = new GeminiClient('test-api-key');
    mockModel = client.model;
  });

  it('should create client with API key', () => {
    expect(client).toBeDefined();
    expect(client.requestTimeout).toBe(30000);
  });

  it('should throw error without API key', () => {
    expect(() => new GeminiClient()).toThrow('Gemini API key is required');
  });

  it('should build prompt correctly', () => {
    const chunk = {
      containerId: 'test-container',
      tsStart: '2024-01-01T00:00:00Z',
      tsEnd: '2024-01-01T00:01:00Z',
      sizeBytes: 1024,
      content: 'Test log content'
    };

    const prompt = client._buildPrompt(chunk);
    
    expect(prompt).toContain('test-container');
    expect(prompt).toContain('2024-01-01T00:00:00Z');
    expect(prompt).toContain('1024');
    expect(prompt).toContain('Test log content');
  });

  it('should parse valid JSON response', () => {
    const responseText = JSON.stringify({
      what_happened: 'Test summary',
      key_events: ['Event 1', 'Event 2'],
      open_questions: ['Question 1']
    });

    const parsed = client._parseResponse(responseText);
    
    expect(parsed.what_happened).toBe('Test summary');
    expect(parsed.key_events).toHaveLength(2);
    expect(parsed.open_questions).toHaveLength(1);
  });

  it('should handle markdown-wrapped JSON response', () => {
    const responseText = '```json\n' + JSON.stringify({
      what_happened: 'Test summary',
      key_events: ['Event 1'],
      open_questions: ['Question 1']
    }) + '\n```';

    const parsed = client._parseResponse(responseText);
    expect(parsed.what_happened).toBe('Test summary');
  });

  it('should truncate what_happened if > 100 characters', () => {
    const longSummary = 'A'.repeat(150);
    const responseText = JSON.stringify({
      what_happened: longSummary,
      key_events: ['Event 1'],
      open_questions: ['Question 1']
    });

    const parsed = client._parseResponse(responseText);
    expect(parsed.what_happened.length).toBe(100);
    expect(parsed.what_happened.endsWith('...')).toBe(true);
  });

  it('should throw error for invalid JSON', () => {
    expect(() => client._parseResponse('invalid json')).toThrow('Invalid JSON response');
  });

  it('should throw error for missing required fields', () => {
    const responseText = JSON.stringify({
      what_happened: 'Test'
      // missing key_events and open_questions
    });

    expect(() => client._parseResponse(responseText)).toThrow('Response missing required fields');
  });

  it('should extract token usage from response', () => {
    const mockResponse = {
      response: {
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
          totalTokenCount: 150
        }
      }
    };

    const usage = client._extractTokenUsage(mockResponse);
    
    expect(usage.tokensIn).toBe(100);
    expect(usage.tokensOut).toBe(50);
    expect(usage.totalTokens).toBe(150);
    expect(usage.costUsd).toBeGreaterThan(0);
  });

  it('should handle missing token usage gracefully', () => {
    const mockResponse = {
      response: {}
    };

    const usage = client._extractTokenUsage(mockResponse);
    
    expect(usage.tokensIn).toBe(0);
    expect(usage.tokensOut).toBe(0);
    expect(usage.totalTokens).toBe(0);
    expect(usage.costUsd).toBe(0);
  });

  it('should summarise chunk successfully', async () => {
    const mockResponse = {
      response: {
        text: () => JSON.stringify({
          what_happened: 'Container started successfully',
          key_events: ['Service initialization', 'Port binding'],
          open_questions: ['Why slow startup?']
        }),
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
          totalTokenCount: 150
        }
      }
    };

    // Add small delay to mock realistic API call
    mockModel.generateContent.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 5))
    );

    const chunk = {
      chunkId: 'test-1',
      containerId: 'test-container',
      tsStart: '2024-01-01T00:00:00Z',
      tsEnd: '2024-01-01T00:01:00Z',
      sizeBytes: 1024,
      content: 'Test log content'
    };

    const result = await client.summariseChunk(chunk);
    
    expect(result.chunkId).toBe('test-1');
    expect(result.summary.what_happened).toBe('Container started successfully');
    expect(result.tokenUsage.totalTokens).toBe(150);
    expect(result.duration).toBeGreaterThan(0);
  });

  it('should handle API timeout', async () => {
    // Create client with very short timeout for testing
    const shortTimeoutClient = new GeminiClient('test-key', { requestTimeout: 10 });
    shortTimeoutClient.model = mockModel;
    
    mockModel.generateContent.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 50)) // Longer than timeout
    );

    const chunk = {
      chunkId: 'test-timeout',
      containerId: 'test',
      content: 'test'
    };

    await expect(shortTimeoutClient.summariseChunk(chunk)).rejects.toThrow('Request timeout');
  }, 1000); // 1 second test timeout

  it('should handle API errors', async () => {
    mockModel.generateContent.mockRejectedValue(new Error('API Error'));

    const chunk = {
      chunkId: 'test-error',
      containerId: 'test',
      content: 'test'
    };

    await expect(client.summariseChunk(chunk)).rejects.toThrow('API Error');
  });
}); 
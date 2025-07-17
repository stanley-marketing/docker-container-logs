import { test, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildApi } from '../src/api.js';
import jwt from 'jsonwebtoken';

let api;
let qaHandlerMock;

beforeAll(async () => {
  // Set a dummy API key for the test environment
  process.env.GEMINI_API_KEY = 'test-key';

  // Create a mock QA handler
  qaHandlerMock = {
    ask: vi.fn()
  };

  api = await buildApi({
    dbPath: ':memory:',
    qaHandler: qaHandlerMock,
    jwtSecret: 'changeme'
  });
  await api.listen({ port: 0 });
});

afterAll(async () => {
  if (api) {
    await api.close();
  }
});

test('GET /health should return { status: "ok" }', async () => {
  const response = await api.inject({
    method: 'GET',
    url: '/health'
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ status: 'ok' });
});

test('GET /metrics should return Prometheus metrics', async () => {
  const response = await api.inject({
    method: 'GET',
    url: '/metrics'
  });

  expect(response.statusCode).toBe(200);
  expect(response.headers['content-type']).toBe('text/plain; version=0.0.4; charset=utf-8');
  expect(response.body).toContain('nodejs_heap_size_total_bytes'); // A default metric
});

test('POST /ask should call qaHandler and return a result', async () => {
  const mockAnswer = { answer: 'This is a test answer.' };
  qaHandlerMock.ask.mockResolvedValue(mockAnswer);

  const response = await api.inject({
    method: 'POST',
    url: '/ask',
    headers: {
      // a dummy token is required by auth
      authorization: `Bearer ${jwt.sign({ sub: 'test' }, 'changeme')}`
    },
    payload: {
      chunk_id: 1,
      question: 'What is the meaning of life?'
    }
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(mockAnswer);
  expect(qaHandlerMock.ask).toHaveBeenCalledWith({
    chunkId: 1,
    question: 'What is the meaning of life?',
    history: []
  });
}); 
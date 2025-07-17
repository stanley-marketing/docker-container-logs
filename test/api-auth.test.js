import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { buildApi } from '../src/api.js';

const SECRET = 'test-secret';
let api;
let request;

beforeAll(async () => {
  process.env.JWT_SECRET = SECRET;
  process.env.GEMINI_API_KEY = 'dummy-key';
  const qaStub = { ask: async () => ({ id: 1, answer: 'stub' }) };
  api = await buildApi({ dbPath: 'data/test-auth.db', qaHandler: qaStub });
  await api.ready();
  request = supertest(api.server);
});

afterAll(async () => {
  await api.close();
  delete process.env.JWT_SECRET;
  delete process.env.GEMINI_API_KEY;
});

describe('JWT middleware', () => {
  it('should return 401 without token', async () => {
    const res = await request.get('/summaries');
    expect(res.statusCode).toBe(401);
  });

  it('should allow with valid token', async () => {
    const token = jwt.sign({ sub: 'tester' }, SECRET);
    const res = await request.get('/summaries').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
}); 
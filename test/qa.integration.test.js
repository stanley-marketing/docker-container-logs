import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import supertest from 'supertest';
import { buildApi } from '../src/api.js';
import jwt from 'jsonwebtoken';
import { qaTokensTotal, qaCostUsdTotal } from '../src/metrics.js';

const SECRET = 'int-secret';
let api;
let request;

beforeAll(async () => {
  process.env.JWT_SECRET = SECRET;
  process.env.GEMINI_API_KEY = 'fake';
  api = await buildApi({ dbPath: 'data/test-qa.db' });
  // stub summarise
  api.qaHandler = api.qaHandler || api; //avoid ts
  const handler = api.qahandler || api.qaHandler || api;
  if (handler.gemini) {
    vi.spyOn(handler.gemini, 'summarise').mockResolvedValue({
      summary: 'Answer', tokensIn: 10, tokensOut: 5, costUsd: 0.00001
    });
  }
  await api.ready();
  request = supertest(api.server);
});

afterAll(async () => {
  await api.close();
  delete process.env.JWT_SECRET;
  delete process.env.GEMINI_API_KEY;
});

describe('POST /ask', () => {
  it('should return answer', async () => {
    const token = jwt.sign({ sub: 'qa' }, SECRET);
    const res = await request.post('/ask')
      .set('Authorization', `Bearer ${token}`)
      .send({ question: 'What happened?' });
    expect(res.statusCode).toBe(200);
    expect(res.body.answer).toBe('Answer');
    // metrics assertions
    expect(qaTokensTotal.hashMap[''].value).toBeGreaterThan(0);
    expect(qaCostUsdTotal.hashMap[''].value).toBeGreaterThan(0);
  });
}); 
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { buildApi } from '../src/api.js';

let api;
let request;

beforeAll(async () => {
  api = await buildApi({ dbPath: 'data/test-api.db' });
  await api.ready();
  request = supertest(api.server);
});

afterAll(async () => {
  await api.close();
});

describe('GET /summaries validation', () => {
  it('should reject invalid limit parameter', async () => {
    const res = await request.get('/summaries?limit=-5');
    expect(res.statusCode).toBe(400);
  });
}); 
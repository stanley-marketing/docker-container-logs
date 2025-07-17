import { test, expect, beforeAll, afterAll } from 'vitest';
import { buildApi } from '../src/api.js';
import jwt from 'jsonwebtoken';

let api;
let token;

beforeAll(async () => {
  process.env.GEMINI_API_KEY = 'test-key';
  token = jwt.sign({ sub: 'tester' }, 'changeme');
  api = await buildApi({ dbPath: ':memory:', jwtSecret: 'changeme' });
  await api.listen({ port: 0 });

  // Seed DB with one chunk + summary
  const db = api.db;
  const chunkId = db.insertChunk({
    container: 'c1',
    tsStart: new Date().toISOString(),
    tsEnd: new Date().toISOString(),
    sizeBytes: 10
  });
  db.insertSummary({
    chunkId,
    summary: { what_happened: 'OK' },
    tokensIn: 1,
    tokensOut: 1,
    costUsd: 0.00001
  });
});

afterAll(async () => {
  await api.close();
});

test('GET /summaries returns list', async () => {
  const res = await api.inject({
    method: 'GET',
    url: '/summaries',
    headers: { authorization: `Bearer ${token}` }
  });
  expect(res.statusCode).toBe(200);
  const json = res.json();
  expect(Array.isArray(json)).toBe(true);
  expect(json.length).toBe(1);
});

test('GET /chunks/:id returns chunk', async () => {
  const list = (await api.inject({ method: 'GET', url: '/summaries', headers: { authorization: `Bearer ${token}` } })).json();
  const id = list[0].id;
  const res = await api.inject({
    method: 'GET',
    url: `/chunks/${id}`,
    headers: { authorization: `Bearer ${token}` }
  });
  expect(res.statusCode).toBe(200);
  const json = res.json();
  expect(json.container).toBe('c1');
});

test('GET /search returns scored results', async () => {
  const res = await api.inject({
    method: 'GET',
    url: '/search?q=ok',
    headers: { authorization: `Bearer ${token}` }
  });
  expect(res.statusCode).toBe(200);
  const json = res.json();
  expect(Array.isArray(json)).toBe(true);
  expect(json[0]).toHaveProperty('score');
}); 
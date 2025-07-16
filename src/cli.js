#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fetch from 'node-fetch';
import { logger } from './utils/logger.js';

// eslint-disable-next-line no-unused-vars
const LOG = logger.child({ module: 'cli' });

const API_URL = process.env.API_URL || 'http://localhost:8000';
const TOKEN = process.env.DLM_TOKEN;

function authHeaders() {
  return TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
}

async function callApi(path, opts = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...opts.headers
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

/* global URLSearchParams */
yargs(hideBin(process.argv))
  .scriptName('dlm')
  .usage('$0 <cmd> [args]')
  .option('token', {
    alias: 't',
    type: 'string',
    description: 'JWT token (overrides DLM_TOKEN env)'
  })
  .middleware((args) => {
    if (args.token) {
      process.env.DLM_TOKEN = args.token;
    }
  })
  .command('list', 'List recent summaries', (y) => {
    return y.option('limit', {
      alias: 'l',
      type: 'number',
      default: 20
    });
  }, async (args) => {
    const qs = new URLSearchParams({ limit: args.limit });
    const data = await callApi(`/summaries?${qs.toString()}`);
    console.table(data);
  })
  .command('show <id>', 'Show raw chunk', (y) => {
    y.positional('id', {
      type: 'number',
      describe: 'Chunk ID'
    });
  }, async (args) => {
    const data = await callApi(`/chunks/${args.id}`);
    console.log(data);
  })
  .command('ask <question>', 'Ask follow-up question', (y) => {
    y.positional('question', { type: 'string' })
      .option('chunk', { alias: 'c', type: 'number', describe: 'Chunk ID context' });
  }, async (args) => {
    const body = { question: args.question };
    if (args.chunk) body.chunk_id = args.chunk;
    const res = await callApi('/ask', { method: 'POST', body: JSON.stringify(body) });
    console.log(res);
  })
  .demandCommand()
  .help()
  .strict()
  .parse(); 
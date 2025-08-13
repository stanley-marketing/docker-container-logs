// SPDX-License-Identifier: MIT
import { logger } from './utils/logger.js';
import { vectorQueriesTotal, vectorLatencySeconds } from './metrics.js';

const LOG = logger.child({ module: 'vector-search' });

// In-memory index { id -> vector }
const index = new Map();

// Helper to tokenize text
function tokenize(text = '') {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

// Convert tokens to frequency map
function toFreq(tokens) {
  const freq = new Map();
  tokens.forEach((t) => freq.set(t, (freq.get(t) || 0) + 1));
  return freq;
}

// Convert frequency map to vector array aligned with given vocabulary
function toVector(freq, vocab) {
  return vocab.map((w) => freq.get(w) || 0);
}

// Cosine similarity
function cosine(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

export function indexSummary(id, text) {
  const tokens = tokenize(text);
  const freq = toFreq(tokens);
  index.set(id, { freq, tokens });
  LOG.debug('📇 [vector-search] Indexed summary', { id });
}

export function rebuildIndex(summaries) {
  index.clear();
  for (const s of summaries) {
    indexSummary(s.id, s.summary);
  }
  LOG.info('🔄 [vector-search] Rebuilt index', { count: index.size });
}

export function search(query, topK = 10) {
  const endTimer = vectorLatencySeconds.startTimer();
  vectorQueriesTotal.inc();
  const queryTokens = tokenize(query);
  const queryFreq = toFreq(queryTokens);

  // Build global vocabulary
  const vocab = Array.from(new Set([
    ...queryTokens,
    ...Array.from(index.values()).flatMap((v) => v.tokens)
  ]));

  const queryVec = toVector(queryFreq, vocab);

  const scored = [];
  for (const [id, { freq }] of index) {
    const vec = toVector(freq, vocab);
    const score = cosine(queryVec, vec);
    scored.push({ id, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, topK);
  endTimer();
  return results;
} 
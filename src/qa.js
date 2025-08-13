// SPDX-License-Identifier: MIT
import { GeminiClient } from './gemini.js';
import { logger } from './utils/logger.js';
import { qaTokensTotal, qaCostUsdTotal } from './metrics.js';
import { search as vectorSearch } from './vector_search.js';

// eslint-disable-next-line no-unused-vars
const LOG = logger.child({ module: 'qa' });

export class QAHandler {
  constructor(db, geminiClient) {
    this.db = db;
    this.gemini = geminiClient;
  }

  async ask({ chunkId, question, history = [] }) {
    // Fetch optional context (first 4KB from selected chunk)
    let contextText = '';
    if (chunkId) {
      const chunk = this.db.getChunk(chunkId);
      if (!chunk) throw new Error('Chunk not found');
      contextText = chunk.content?.slice(0, 4096) || '';
    } else {
      // Fallback: pull top summaries by semantic similarity to build context
      const top = vectorSearch(question, 3);
      if (top.length) {
        const parts = [];
        for (const res of top) {
          const row = this.db.statements.getSummary.get(res.id);
          if (row) {
            parts.push(row.summary);
          }
        }
        contextText = parts.join('\n---\n').slice(0, 4096);
      }
    }

    const prompt = this._buildPrompt(question, contextText, history);

    // Execute Gemini request directly (no JSON parsing needed)
    const startTime = Date.now();
    const result = await this.gemini.model.generateContent(prompt);
    const answerText = result.response.text();

    // Extract token usage & cost if available
    const usage = result.response.usageMetadata || {};
    const tokensIn = usage.promptTokenCount || 0;
    const tokensOut = usage.candidatesTokenCount || 0;
    const costPerInputToken = 0.00000015;
    const costPerOutputToken = 0.0000006;
    const costUsd = (tokensIn * costPerInputToken) + (tokensOut * costPerOutputToken);

    // Persist QA session
    const qaSessionId = this.db.insertQA({
      chunkId: chunkId ?? null,
      question,
      answer: answerText,
      tokensIn,
      tokensOut,
      costUsd
    });

    // Increment Prometheus metrics
    const tokensTotal = tokensIn + tokensOut;
    qaTokensTotal.inc(tokensTotal);
    qaCostUsdTotal.inc(costUsd);

    LOG.info('💬 [qa] Q&A completed', {
      qaSessionId,
      chunkId: chunkId ?? null,
      tokensIn,
      tokensOut,
      costUsd: costUsd.toFixed(6),
      durationMs: Date.now() - startTime
    });

    return { id: qaSessionId, answer: answerText };
  }

  _buildPrompt(question, context, history = []) {
    const convo = history
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    return `You are a helpful assistant. Context:\n${context}\n\nConversation so far:\n${convo}\n\nUser: ${question}\nAssistant:`;
  }
}

export function createQAHandler(db) {
  const apiKey = process.env.GEMINI_API_KEY;
  const geminiClient = new GeminiClient(apiKey, { retry: { maxRetries: 2 } });
  return new QAHandler(db, geminiClient);
} 
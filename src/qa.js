import { GeminiClient } from './gemini.js';
import { logger } from './utils/logger.js';

// eslint-disable-next-line no-unused-vars
const LOG = logger.child({ module: 'qa' });

export class QAHandler {
  constructor(db, geminiClient) {
    this.db = db;
    this.gemini = geminiClient;
  }

  async ask({ chunkId, question }) {
    // Fetch context
    let contextText = '';
    if (chunkId) {
      const chunk = this.db.getChunk(chunkId);
      if (!chunk) throw new Error('Chunk not found');
      contextText = chunk.content?.slice(0, 4096) || '';
    }
    const prompt = this._buildPrompt(question, contextText);
    const result = await this.gemini.summarise({
      chunkId: `qa-${Date.now()}`,
      containerId: 'qa',
      tsStart: new Date().toISOString(),
      tsEnd: new Date().toISOString(),
      sizeBytes: prompt.length,
      content: prompt
    });

    // Persist QA session
    const qaSessionId = this.db.insertQA({
      chunkId,
      question,
      answer: result.summary,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      costUsd: result.costUsd
    });

    return { id: qaSessionId, answer: result.summary };
  }

  _buildPrompt(question, context) {
    return `You are a helpful assistant. Context:\n${context}\n\nQuestion: ${question}`;
  }
}

export function createQAHandler(db) {
  const apiKey = process.env.GEMINI_API_KEY;
  const geminiClient = new GeminiClient(apiKey, { retry: { maxRetries: 2 } });
  return new QAHandler(db, geminiClient);
} 
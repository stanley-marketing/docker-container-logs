// SPDX-License-Identifier: MIT
/*
 * 🗂️ Shared JSON Schemas for Fastify route validation
 */

export const summariesQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
    container: { type: 'string' },
    from: { type: 'string', format: 'date-time' },
    to: { type: 'string', format: 'date-time' }
  },
  additionalProperties: false
};

export const chunkParamsSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' }
  },
  required: ['id']
};

export const askBodySchema = {
  type: 'object',
  required: ['question'],
  properties: {
    chunk_id: { type: ['integer', 'null'] },
    question: { type: 'string' },
    history: {
      type: 'array',
      items: {
        type: 'object',
        required: ['role', 'content'],
        properties: {
          role: { type: 'string', enum: ['user', 'assistant'] },
          content: { type: 'string' }
        }
      },
      default: []
    }
  }
};

export const loginBodySchema = {
  type: 'object',
  required: ['username','password'],
  properties: {
    username: { type: 'string' },
    password: { type: 'string' }
  }
}; 
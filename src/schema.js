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
  properties: {
    chunk_id: { type: 'integer' },
    question: { type: 'string' },
    from: { type: 'string', format: 'date-time' },
    to: { type: 'string', format: 'date-time' }
  },
  required: ['question'],
  additionalProperties: false
}; 
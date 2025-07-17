import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { DatabaseManager } from './models.js';
import { metricsRegistry } from './metrics.js';
import { logger } from './utils/logger.js';
import { summariesQuerySchema, chunkParamsSchema, askBodySchema } from './schema.js';
import { buildVerifyJwt } from './auth.js';
import { createQAHandler } from './qa.js';
import { rebuildIndex, search as vectorSearch } from './vector_search.js';
import { attachWebsocket } from './websocket.js';
import { loginBodySchema } from './schema.js';
import { generateJwt } from './auth.js';

const LOG = logger.child({ module: 'api' });

export async function buildApi(options = {}) {
  const fastify = Fastify({
    logger: false
  });

  // Enable CORS (configurable)
  await fastify.register(cors, {
    origin: options.corsOrigin || process.env.CORS_ORIGIN || '*',
    credentials: true
  });

  // Register Swagger (OpenAPI) docs
  await fastify.register(swagger, {
    swagger: {
      info: { title: 'Docker Log Summaries API', version: '0.1.0' }
    }
  });
  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: (header) => header
  });

  // Database setup
  const dbPath = options.dbPath || 'data/docker-logs.db';
  const db = new DatabaseManager(dbPath);
  await db.initialize();
  fastify.decorate('db', db);

  // Build vector index on startup
  const allSummaries = db.db.prepare(`SELECT id, summary FROM summaries`).all();
  rebuildIndex(allSummaries);

  // Allow injecting a QA handler for testing
  const qaHandler = options.qaHandler || createQAHandler(db);
  fastify.decorate('qaHandler', qaHandler);

  // JWT verification preHandler – require secret
  const jwtSecret = options.jwtSecret || process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET env var must be set');
  }
  const verifyJwt = buildVerifyJwt(jwtSecret);

  // Attach websocket (after jwtSecret available)
  attachWebsocket(fastify, { jwtSecret });

  // Simple login route
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'changeme';

  fastify.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login and receive JWT',
      body: loginBodySchema,
      response: {
        200: { type: 'object', properties: { token: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    const { username, password } = req.body;
    if (username !== adminUser || password !== adminPass) {
      reply.code(401);
      return { error: 'Invalid credentials' };
    }
    const token = generateJwt({ sub: username }, jwtSecret);
    return { token };
  });

  // Simple health route
  fastify.get('/health', {
    schema: {
      tags: ['Utility'],
      summary: 'Health Check',
      description: 'Returns `{ status: "ok" }` when the API is healthy.',
      response: {
        200: {
          type: 'object',
          properties: { status: { type: 'string' } }
        }
      }
    }
  }, async () => {
    return { status: 'ok' };
  });

  // Metrics route
  fastify.get('/metrics', {
    schema: {
      tags: ['Utility'],
      summary: 'Prometheus Metrics',
      description: 'Exposes Prometheus metrics in the standard text format.',
      response: {
        200: { type: 'string', description: 'Prometheus metrics payload' }
      }
    }
  }, async (_req, reply) => {
    reply.header('Content-Type', metricsRegistry.contentType);
    reply.send(await metricsRegistry.metrics());
  });

  /**
   * GET /summaries?limit=&container=&from=&to=
   */
  fastify.get('/summaries', {
    preHandler: verifyJwt,
    schema: {
      tags: ['Summaries'],
      summary: 'List summaries',
      description: 'Returns recent log summaries with optional filters.',
      querystring: summariesQuerySchema,
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              container: { type: 'string' },
              ts_start: { type: 'string' },
              ts_end: { type: 'string' },
              summary: { type: 'string' },
              cost_usd: { type: 'number' },
              created_at: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (req, _reply) => {
    const {
      limit = 100,
      container,
      from,
      to
    } = req.query;

    let sql = `SELECT s.id, c.id as chunk_id, c.container, c.ts_start, c.ts_end, s.summary, s.cost_usd, s.created_at
               FROM summaries s JOIN chunks c ON s.chunk_id = c.id`;
    const params = [];
    const where = [];

    if (container) {
      where.push('c.container = ?');
      params.push(container);
    }
    if (from) {
      where.push('c.ts_start >= ?');
      params.push(from);
    }
    if (to) {
      where.push('c.ts_end <= ?');
      params.push(to);
    }
    if (where.length) {
      sql += ' WHERE ' + where.join(' AND ');
    }
    sql += ' ORDER BY s.created_at DESC LIMIT ?';
    params.push(limit);

    const rows = db.db.prepare(sql).all(...params);
    return rows;
  });

  /**
   * GET /chunks/:id – return raw chunk record (content path for now)
   */
  fastify.get('/chunks/:id', { preHandler: verifyJwt, schema: { params: chunkParamsSchema } }, async (req, reply) => {
    const { id } = req.params;
    const chunk = db.getChunk(id);
    if (!chunk) {
      reply.code(404);
      return { error: 'Chunk not found' };
    }
    return chunk;
  });

  /**
   * GET /search?query=
   */
  fastify.get('/search', {
    preHandler: verifyJwt,
    schema: {
      tags: ['Search'],
      summary: 'Semantic search summaries',
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
        },
        required: ['q']
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              score: { type: 'number' }
            }
          }
        }
      }
    }
  }, async (req) => {
    const { q, limit = 10 } = req.query;
    const results = vectorSearch(q, limit);
    return results;
  });

  /**
   * POST /ask – Placeholder handler
   */
  fastify.post('/ask', { preHandler: verifyJwt, schema: { body: askBodySchema } }, async (req) => {
    const { chunk_id: chunkId, question, history = [] } = req.body;
    const result = await qaHandler.ask({ chunkId, question, history });
    return result;
  });

  return fastify;
}

// If executed directly, start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const port = process.env.PORT || 8000;
    const api = await buildApi();
    api.listen({ port, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        LOG.error('💥 [api] Failed to start', { error: err.message });
        process.exit(1);
      }
      LOG.info(`🌐 [api] Server listening at ${address}`);
    });
  })();
} 
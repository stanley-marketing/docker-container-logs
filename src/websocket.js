// SPDX-License-Identifier: MIT
import { Server as SocketIOServer } from 'socket.io';
import { buildVerifyJwt } from './auth.js';
import { logger } from './utils/logger.js';

const LOG = logger.child({ module: 'ws' });

/**
 * Attach Socket.IO server to Fastify instance.
 * Exposes `fastify.io` and handles `ask` events for streaming QA.
 * @param {import('fastify').FastifyInstance} fastify 
 * @param {object} options 
 */
export function attachWebsocket(fastify, options = {}) {
  const jwtSecret = options.jwtSecret || process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET required for websocket auth');
  }
  const verifyJwt = buildVerifyJwt(jwtSecret);

  // socket.io binds to the underlying Node HTTP server
  const io = new SocketIOServer(fastify.server, {
    cors: {
      origin: options.corsOrigin || process.env.CORS_ORIGIN || '*'
    }
  });

  fastify.decorate('io', io);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    const fakeReq = { headers: { authorization: `Bearer ${token}` } };
    const fakeReply = { code: () => fakeReply, send: () => {} };
    verifyJwt(fakeReq, fakeReply, (err) => {
      if (err) {
        LOG.warn('Unauthorized socket connection', { err: err.message });
        return next(new Error('unauthorized'));
      }
      socket.user = fakeReq.user; // from verifyJwt side effect
      next();
    });
  });

  io.on('connection', (socket) => {
    LOG.info('📡 [ws] client connected', { sid: socket.id });

    socket.on('ask', async (payload) => {
      try {
        const { question, history = [], chunkId = null } = payload || {};
        if (!question) return;
        const qaHandler = fastify.qaHandler;
        // For now, get full answer then emit; TODO: stream via Gemini API if available
        const result = await qaHandler.ask({ question, history, chunkId });
        socket.emit('answer', result);
      } catch (err) {
        socket.emit('error', { error: err.message });
      }
    });

    socket.on('disconnect', () => {
      LOG.info('📴 [ws] client disconnected', { sid: socket.id });
    });
  });
} 
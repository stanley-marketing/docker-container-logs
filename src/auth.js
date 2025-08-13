// SPDX-License-Identifier: MIT
import jwt from 'jsonwebtoken';
import { logger } from './utils/logger.js';

export function generateJwt(payload, secret, opts = {}) {
  if (!secret) throw new Error('JWT secret not provided');
  return jwt.sign(payload, secret, { expiresIn: opts.expiresIn || '7d' });
}

const LOG = logger.child({ module: 'auth' });

/**
 * Fastify preHandler to verify JWT Bearer token.
 * @param {string} secret - JWT verification secret.
 */
export function buildVerifyJwt(secret) {
  if (!secret) {
    throw new Error('JWT secret not provided');
  }
  return async function verifyJwt(req, reply) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      reply.code(401);
      return { error: 'Missing Authorization Bearer token' };
    }
    const token = auth.slice(7);
    try {
      const payload = jwt.verify(token, secret);
      req.user = payload;
    } catch (err) {
      LOG.warn('⚠️ [auth] Invalid token', { error: err.message });
      reply.code(401);
      return { error: 'Invalid token' };
    }
  };
} 
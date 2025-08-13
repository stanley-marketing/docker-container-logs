// SPDX-License-Identifier: MIT
/**
 * 📝 Logging utility with structured output
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format with emoji prefixes
const customFormat = printf(({ level, message, timestamp: ts, module, ...meta }) => {
  const emoji = {
    error: '💥',
    warn: '⚠️',
    info: '📝',
    debug: '🔍'
  }[level] || '📝';
  
  const moduleStr = module ? `[${module}]` : '';
  const metaStr = Object.keys(meta).length > 0 ? `\\n${JSON.stringify(meta, null, 2)}` : '';
  
  return `${emoji} ${ts} ${moduleStr} ${level.toUpperCase()} – ${message}${metaStr}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      )
    })
  ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error'
  }));
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log'
  }));
} 
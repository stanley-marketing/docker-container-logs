#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { LogCollector } from './collector.js';
import { GeminiSummariser } from './summariser.js';
import { DatabaseManager } from './models.js';
import { buildApi } from './api.js';
import { logger } from './utils/logger.js';

const LOG = logger.child({ module: 'main' });

async function main(argv) {
  try {
    LOG.info('🚀 [main] Starting Docker Log Summariser MCP v0.1.0');
    
    // Database
    const db = new DatabaseManager(argv.dbPath);
    await db.initialize();

    // Summariser
    const summariser = new GeminiSummariser(process.env.GEMINI_API_KEY, db, {
      consumer: { maxQueueSize: argv.maxQueue, processingDelay: 10 }
    });
    await summariser.start();
    
    // Collector
    const collector = new LogCollector();
    collector.on('chunk', (chunk) => {
      summariser.submitChunk(chunk);
    });
    await collector.start(argv);

    // API Server
    if (argv.api) {
      const api = await buildApi({ dbPath: argv.dbPath });
      await api.listen({ port: argv.port, host: '0.0.0.0' });
      LOG.info(`🌐 [main] API server listening on port ${argv.port}`);
    }
    
    LOG.info('✅ [main] Service started successfully');
    
    const shutdown = async () => {
      LOG.info('🛑 [main] Shutting down gracefully');
      await collector.stop();
      await summariser.stop();
      db.close();
      process.exit(0);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    LOG.error('💥 [main] Failed to start service', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

const cliArgs = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .option('all', {
    alias: 'a',
    type: 'boolean',
    description: 'Monitor all running Docker containers'
  })
  .option('label', {
    alias: 'l',
    type: 'string',
    description: 'Monitor containers with a specific label (e.g., "app=web")'
  })
  .option('file', {
    alias: 'f',
    type: 'string',
    description: 'Read logs from a file path'
  })
  .option('follow', {
    type: 'boolean',
    description: 'Follow the file for new logs (used with --file)'
  })
  .option('url', {
    alias: 'u',
    type: 'string',
    description: 'Read logs from an HTTP(S) URL'
  })
  .option('api', {
    type: 'boolean',
    default: true,
    description: 'Start the REST API server'
  })
  .option('port', {
    type: 'number',
    default: 8000,
    description: 'Port for the API server'
  })
  .option('db-path', {
    type: 'string',
    default: 'data/docker-logs.db',
    description: 'Path to the SQLite database file'
  })
  .option('max-queue', {
    type: 'number',
    default: 1000,
    description: 'Maximum size of the summarisation queue'
  })
  .conflicts({
    all: ['label', 'file', 'url'],
    label: ['all', 'file', 'url'],
    file: ['all', 'label', 'url'],
    url: ['all', 'label', 'file']
  })
  .check((argv) => {
    if (!argv.all && !argv.label && !argv.file && !argv.url) {
      throw new Error('You must specify a log source: --all, --label, --file, or --url');
    }
    return true;
  })
  .help()
  .argv;

if (import.meta.url === `file://${process.argv[1]}`) {
  main(cliArgs);
}

export { main }; 
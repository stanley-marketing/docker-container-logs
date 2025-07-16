#!/usr/bin/env node

/**
 * 🐳 Docker Log Summariser MCP
 * 
 * Main entry point for the service that streams Docker logs,
 * chunks them, summarises with Gemini, and provides Q&A interface.
 */

// import { LogCollector } from './collector.js'; // TODO: Uncomment when implementing CLI
import { logger } from './utils/logger.js';

const LOG = logger.child({ module: 'main' });

async function main() {
  try {
    LOG.info('🚀 [docker-log-mcp] Starting Docker Log Summariser MCP v0.1.0');
    
    // TODO: Parse CLI args with yargs
    // TODO: Initialize database
    // TODO: Start log collector
    // TODO: Start API server
    
    LOG.info('✅ [docker-log-mcp] Service started successfully');
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      LOG.info('🛑 [docker-log-mcp] Received SIGTERM, shutting down gracefully');
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      LOG.info('🛑 [docker-log-mcp] Received SIGINT, shutting down gracefully');
      process.exit(0);
    });
    
  } catch (error) {
    LOG.error('💥 [docker-log-mcp] Failed to start service', { error: error.message });
    process.exit(1);
  }
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main }; 
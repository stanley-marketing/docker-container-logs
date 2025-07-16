/**
 * 🐳 Docker Log Collector & Chunker
 * 
 * Streams logs from Docker containers, performs redaction, buffers lines into
 * chunks based on size or time and yields ready chunks to downstream consumers.
 */

import Docker from 'dockerode';
import { EventEmitter } from 'events';
import { logger } from './utils/logger.js';

const LOG = logger.child({ module: 'collector' });

// Secret redaction patterns (extendable)
const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/g,           // AWS Access Key
  /[A-Fa-f0-9]{12,}/g,          // hex ≥ 12 chars
  /ey[A-Za-z0-9_-]{20,}/g,      // JWT-like tokens
];

// ANSI escape code pattern
// eslint-disable-next-line no-control-regex
const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

/**
 * Chunker class that buffers log lines and emits chunks when size/time limits are reached
 */
export class Chunker extends EventEmitter {
  constructor(containerId, maxAge = 30000, maxSize = 8192) {
    super();
    this.containerId = containerId;
    this.maxAge = maxAge;
    this.maxSize = maxSize;
    this.buffer = '';
    this.sizeBytes = 0;
    this.chunkId = 0;
    this.startTime = Date.now();
    this.flushTimer = null;
    
    this._scheduleFlush();
  }

  /**
   * Feed a log line to the chunker
   * @param {string} line - Raw log line
   * @returns {Object|null} - Chunk object if flushed, null otherwise
   */
  feed(line) {
    // Strip ANSI codes
    const cleanLine = line.replace(ANSI_PATTERN, '');
    
    // Apply secret redaction
    let redactedLine = cleanLine;
    for (const pattern of SECRET_PATTERNS) {
      redactedLine = redactedLine.replace(pattern, '**REDACTED**');
    }
    
    this.buffer += redactedLine;
    this.sizeBytes += Buffer.byteLength(redactedLine, 'utf8');
    
    // Check if we need to flush due to size
    if (this.sizeBytes >= this.maxSize) {
      return this._flush('size');
    }
    
    return null;
  }

  /**
   * Force flush the current buffer
   * @param {string} reason - Reason for flush ('size', 'time', 'manual')
   * @returns {Object|null} - Chunk object if buffer has content, null otherwise
   */
  _flush(reason = 'manual') {
    if (this.sizeBytes === 0) {
      return null;
    }
    
    const chunk = {
      chunkId: `${this.containerId}-${++this.chunkId}`,
      containerId: this.containerId,
      content: this.buffer,
      sizeBytes: this.sizeBytes,
      tsStart: new Date(this.startTime).toISOString(),
      tsEnd: new Date().toISOString(),
      reason
    };
    
    // Reset buffer
    this.buffer = '';
    this.sizeBytes = 0;
    this.startTime = Date.now();
    this._scheduleFlush();
    
    LOG.debug(`📦 [collector/${this.containerId}] Chunk flushed`, { 
      chunkId: chunk.chunkId, 
      size: chunk.sizeBytes, 
      reason 
    });
    
    this.emit('chunk', chunk);
    return chunk;
  }

  /**
   * Schedule automatic flush based on time
   */
  _scheduleFlush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    
    this.flushTimer = setTimeout(() => {
      this._flush('time');
    }, this.maxAge);
  }

  /**
   * Clean up timers
   */
  destroy() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this._flush('destroy');
  }
}

/**
 * Main log collector class
 */
export class LogCollector extends EventEmitter {
  constructor(options = {}) {
    super();
    this.docker = new Docker(options.docker || {});
    this.chunkers = new Map();
    this.containers = new Map();
    this.running = false;
  }

  /**
   * Start collecting logs from specified containers
   * @param {Object} options - Collection options
   * @param {boolean} options.all - Collect from all containers
   * @param {Object} options.labels - Filter by labels
   */
  async start(options = {}) {
    if (this.running) {
      throw new Error('LogCollector is already running');
    }
    
    this.running = true;
    LOG.info('🚀 [collector] Starting log collection', options);
    
    try {
      // Discover containers
      const containers = await this._discoverContainers(options);
      LOG.info(`🔍 [collector] Found ${containers.length} containers to monitor`);
      
      // Start monitoring each container
      for (const container of containers) {
        await this._attachToContainer(container);
      }
      
    } catch (error) {
      LOG.error('💥 [collector] Failed to start log collection', { error: error.message });
      this.running = false;
      throw error;
    }
  }

  /**
   * Stop collecting logs and clean up
   */
  async stop() {
    if (!this.running) {
      return;
    }
    
    LOG.info('🛑 [collector] Stopping log collection');
    this.running = false;
    
    // Clean up all chunkers
    for (const chunker of this.chunkers.values()) {
      chunker.destroy();
    }
    this.chunkers.clear();
    this.containers.clear();
    
    LOG.info('✅ [collector] Log collection stopped');
  }

  /**
   * Discover containers based on options
   */
  async _discoverContainers(options) {
    const listOptions = {
      all: false, // Only running containers
    };
    
    if (options.labels) {
      listOptions.filters = { label: Object.entries(options.labels).map(([k, v]) => `${k}=${v}`) };
    }
    
    const containers = await this.docker.listContainers(listOptions);
    return containers;
  }

  /**
   * Attach to a single container for log streaming
   */
  async _attachToContainer(containerInfo) {
    const containerId = containerInfo.Id.substring(0, 12);
    const containerName = containerInfo.Names[0]?.substring(1) || containerId;
    
    LOG.info(`🔗 [collector/${containerId}] Attaching to container ${containerName}`);
    
    try {
      const container = this.docker.getContainer(containerInfo.Id);
      const chunker = new Chunker(containerId);
      
      // Forward chunks from chunker
      chunker.on('chunk', (chunk) => {
        this.emit('chunk', chunk);
      });
      
      this.chunkers.set(containerId, chunker);
      this.containers.set(containerId, { container, info: containerInfo });
      
      // Start streaming logs
      const logStream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true,
        timestamps: true,
        tail: 0
      });
      
      logStream.on('data', (data) => {
        // dockerode returns multiplexed stream, we need to handle the header
        const lines = data.toString().split('\n').filter(line => line.trim());
        for (const line of lines) {
          chunker.feed(line + '\n');
        }
      });
      
      logStream.on('error', (error) => {
        LOG.error(`💥 [collector/${containerId}] Log stream error`, { error: error.message });
        // TODO: Implement reconnection logic
      });
      
      logStream.on('end', () => {
        LOG.warn(`🔚 [collector/${containerId}] Log stream ended`);
        // TODO: Implement reconnection logic
      });
      
    } catch (error) {
      LOG.error(`💥 [collector/${containerId}] Failed to attach to container`, { error: error.message });
      throw error;
    }
  }
}

export default LogCollector; 
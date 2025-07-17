/**
 * 🐳 Docker Log Collector & Chunker
 * 
 * Streams logs from Docker containers, performs redaction, buffers lines into
 * chunks based on size or time and yields ready chunks to downstream consumers.
 */

import Docker from 'dockerode';
import { DockerSourceReader, FileSourceReader, URLSourceReader } from './sources.js';
import { EventEmitter } from 'events';
import { logger } from './utils/logger.js';
import { logLinesTotal, bytesIngestedTotal, chunksTotal } from './metrics.js';

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
  // maxSize default ~500 kB (≈125 k tokens) aligns better with Gemini context window
  constructor(containerId, maxAge = 30000, maxSize = 500_000, sourceType = 'docker') {
    super();
    this.containerId = containerId;
    this.sourceType = sourceType;
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

    // Increment Prometheus counter for each ingested line
    logLinesTotal.inc();
    
    this.buffer += redactedLine;
    const bytes = Buffer.byteLength(redactedLine, 'utf8');
    this.sizeBytes += bytes;

    // Increment bytes ingested counter
    bytesIngestedTotal.inc({ source_type: this.sourceType }, bytes);
    
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
    
    // Increment chunks total metric
    chunksTotal.inc({ source_type: this.sourceType });
    
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
    this.sourceReaders = new Map();
    this.running = false;
  }

  /**
   * Start collecting logs from specified containers
   * @param {Object} options - Collection options
   * @param {boolean} [options.all] - Collect from all containers
   * @param {Object} [options.labels] - Filter by labels
   * @param {string} [options.file] - Collect from a file path
   * @param {string} [options.url] - Collect from a URL
   */
  async start(options = {}) {
    if (this.running) {
      throw new Error('LogCollector is already running');
    }
    
    this.running = true;
    LOG.info('🚀 [collector] Starting log collection', options);
    
    try {
      if (options.file) {
        await this._startFileSource(options.file, options);
      } else if (options.url) {
        await this._startUrlSource(options.url, options);
      } else {
      const containers = await this._discoverContainers(options);
      LOG.info(`🔍 [collector] Found ${containers.length} containers to monitor`);
      for (const container of containers) {
        await this._attachToContainer(container);
        }
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
    
    for (const reader of this.sourceReaders.values()) {
        await reader.stop();
      }

    this.sourceReaders.clear();
    
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
    
    try {
      const container = this.docker.getContainer(containerInfo.Id);
      const reader = new DockerSourceReader(container, containerInfo);

      reader.on('chunk', (chunk) => {
        this.emit('chunk', chunk);
      });
      await reader.start();
      this.sourceReaders.set(reader.sourceId, reader);
       
    } catch (error) {
      LOG.error(`💥 [collector/${containerId}] Failed to attach to container`, { error: error.message });
      throw error;
    }
  }

  async _startFileSource(filePath, options) {
    const reader = new FileSourceReader(filePath, options);
    reader.on('chunk', (chunk) => this.emit('chunk', chunk));
    await reader.start();
    this.sourceReaders.set(reader.sourceId, reader);
  }

  async _startUrlSource(url, options) {
    const reader = new URLSourceReader(url, options);
    reader.on('chunk', (chunk) => this.emit('chunk', chunk));
    await reader.start();
    this.sourceReaders.set(reader.sourceId, reader);
  }
}

export default LogCollector; 
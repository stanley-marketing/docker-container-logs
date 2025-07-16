import { EventEmitter } from 'events';
import { Chunker } from './collector.js';
import { logger } from './utils/logger.js';
import fs from 'fs';
import readline from 'readline';

const LOG = logger.child({ module: 'source-reader' });

/**
 * Base class for all log source readers (Docker, File, URL, …).
 * Emits `line`, `error`, `end` – but downstream collectors typically attach a Chunker
 * and listen for `chunk` events.
 */
export class AbstractSourceReader extends EventEmitter {
  constructor(sourceId) {
    super();
    this.sourceId = sourceId;
    this.running = false;
  }

  /** @abstract */
  async start() {
    throw new Error('start() not implemented');
  }

  /** @abstract */
  async stop() {
    throw new Error('stop() not implemented');
  }
}

/**
 * Docker container log reader – wraps dockerode stream and feeds into a Chunker.
 */
export class DockerSourceReader extends AbstractSourceReader {
  /**
   * @param {import('dockerode').Container} container - dockerode container instance
   * @param {Object} info - container info object from listContainers
   * @param {Object} [options]
   */
  constructor(container, info, options = {}) {
    const containerId = info?.Id?.substring(0, 12) || 'unknown';
    super(`docker:${containerId}`);

    this.container = container;
    this.containerInfo = info;

    const { maxAge = 30000, maxSize = 8192 } = options;
    this.chunker = new Chunker(containerId, maxAge, maxSize);

    // Forward chunk events upstream
    this.chunker.on('chunk', (chunk) => {
      this.emit('chunk', chunk);
    });
  }

  async start() {
    if (this.running) return;
    this.running = true;
    const containerId = this.containerInfo.Id.substring(0, 12);
    const containerName = this.containerInfo.Names?.[0]?.substring(1) || containerId;

    LOG.info(`🔗 [collector/${containerId}] Attaching to container ${containerName}`);

    try {
      const logStream = await this.container.logs({
        follow: true,
        stdout: true,
        stderr: true,
        timestamps: true,
        tail: 0
      });

      logStream.on('data', (data) => {
        const lines = data.toString().split('\n').filter((l) => l.trim());
        for (const line of lines) {
          this.chunker.feed(line + '\n');
        }
      });

      logStream.on('error', (error) => {
        LOG.error(`💥 [collector/${containerId}] Log stream error`, { error: error.message });
        this.emit('error', error);
      });

      logStream.on('end', () => {
        LOG.warn(`🔚 [collector/${containerId}] Log stream ended`);
        this.emit('end');
      });
    } catch (error) {
      LOG.error(`💥 [collector/${containerId}] Failed to attach to container`, { error: error.message });
      throw error;
    }
  }

  async stop() {
    if (!this.running) return;
    this.running = false;
    this.chunker.destroy();
  }
}

/**
 * Placeholder implementation for reading logs from a local file.
 * Full implementation will follow in later phases of Story 1.4.
 */
export class FileSourceReader extends AbstractSourceReader {
  /**
   * @param {string} filePath - Path to log file
   * @param {Object} [options]
   * @param {boolean} [options.follow=false] - Follow file like tail -F (handles rotation)
   * @param {number} [options.maxAge] - Chunker flush age (ms)
   * @param {number} [options.maxSize] - Chunker max size (bytes)
   */
  constructor(filePath, options = {}) {
    super(`file:${filePath}`);
    this.filePath = fs.realpathSync(filePath);
    this.follow = options.follow || false;

    const { maxAge = 30000, maxSize = 8192 } = options;
    this.chunker = new Chunker(this.sourceId, maxAge, maxSize);
    this.chunker.on('chunk', (chunk) => this.emit('chunk', chunk));

    this._reader = null; // readline.Interface
    this._watcher = null; // fs.FSWatcher for follow
  }

  async start() {
    if (this.running) return;
    this.running = true;

    await this._openStream();

    if (this.follow) {
      this._setupWatcher();
    }
  }

  async _openStream(position = 0) {
    const stream = fs.createReadStream(this.filePath, {
      encoding: 'utf8',
      start: position,
    });

    this._reader = readline.createInterface({ input: stream });

    this._reader.on('line', (line) => {
      this.chunker.feed(line + '\n');
    });

    this._reader.on('close', () => {
      if (!this.follow) {
        this.emit('end');
      }
    });

    stream.on('error', (err) => {
      LOG.error('💥 [collector/file] Stream error', { error: err.message, file: this.filePath });
      this.emit('error', err);
    });
  }

  _setupWatcher() {
    // Watch for file rename (rotation) & change to continue streaming
    this._watcher = fs.watch(this.filePath, (eventType) => {
      if (eventType === 'rename') {
        // File rotated – reopen new file path once available
        setTimeout(() => {
          if (fs.existsSync(this.filePath)) {
            this._openStream(0);
          }
        }, 1000);
      }
    });
  }

  async stop() {
    if (!this.running) return;
    this.running = false;

    if (this._watcher) {
      this._watcher.close();
      this._watcher = null;
    }

    if (this._reader) {
      this._reader.close();
      this._reader = null;
    }

    this.chunker.destroy();
  }
}

/**
 * Placeholder implementation for reading logs from an HTTP(S) URL.
 */
export class URLSourceReader extends AbstractSourceReader {
  constructor(url) {
    super(`url:${url}`);
    // TODO: implement streaming logic in Phase 3
  }
  async start() {
    throw new Error('URLSourceReader not implemented yet');
  }
  async stop() {}
} 
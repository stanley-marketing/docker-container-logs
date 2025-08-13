// SPDX-License-Identifier: MIT
import { EventEmitter } from 'events';
import { Chunker } from './collector.js';
import { logger } from './utils/logger.js';
import fs from 'fs';
import readline from 'readline';
import zlib from 'zlib';
import fetch from 'node-fetch';
import { collectorSourceErrorsTotal } from './metrics.js';
import { URL } from 'url';

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
    this.chunker = new Chunker(containerId, maxAge, maxSize, 'docker');

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
 * Reads logs from a local file, with optional tailing (`-f`) support.
 */
export class FileSourceReader extends AbstractSourceReader {
  constructor(filePath, options = {}) {
    const absPath = fs.realpathSync(filePath);
    super(`file:${absPath}`);
    this.filePath = absPath;
    this.follow = options.follow || false;

    const { maxAge = 30000, maxSize } = options;
    this.chunker = new Chunker(this.sourceId, maxAge, maxSize, 'file');
    this.chunker.on('chunk', (chunk) => this.emit('chunk', chunk));
  }

  async start() {
    if (this.running) return;
    this.running = true;
    LOG.info(`📂 [collector/file] Starting to read from ${this.filePath}`, { follow: this.follow });

    const stream = fs.createReadStream(this.filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream });

    rl.on('line', (line) => {
      this.chunker.feed(line + '\n');
    });

    rl.on('close', () => {
      if (!this.follow) {
        LOG.info(`🔚 [collector/file] Finished reading ${this.filePath}`);
        this.emit('end');
      }
    });

    stream.on('error', (err) => {
      LOG.error('💥 [collector/file] Stream error', { error: err.message });
      collectorSourceErrorsTotal.inc({ source_type: 'file' });
      this.emit('error', err);
    });

    if (this.follow) {
      // Enhanced follow mode – tail -F style with rotation handling
      let { size: lastSize, ino: lastInode } = fs.statSync(this.filePath);

      const readIncrement = (start) => {
        const incrStream = fs.createReadStream(this.filePath, { start, encoding: 'utf8' });
        incrStream.on('data', (data) => {
            const lines = data.toString().split('\n');
          lines.forEach((l) => this.chunker.feed(l + '\n'));
          });
      };

      fs.watchFile(
        this.filePath,
        { interval: 1000 },
        (curr, _prev) => {
          // Detect rotation: inode changed OR file truncated (size shrank)
          const rotated = curr.ino !== lastInode || curr.size < lastSize;
          if (rotated) {
            LOG.info('♻️ [collector/file] Log rotation detected', {
              path: this.filePath,
              oldInode: lastInode,
              newInode: curr.ino,
            });
            lastSize = 0; // start reading from beginning of new file
            lastInode = curr.ino;
          }

          // New data appended
          if (curr.size > lastSize) {
            readIncrement(lastSize);
            lastSize = curr.size;
          }
        }
      );
    }
  }

  async stop() {
    if (!this.running) return;
    this.running = false;
    fs.unwatchFile(this.filePath);
    this.chunker.destroy();
    LOG.info(`🛑 [collector/file] Stopped reading from ${this.filePath}`);
  }
}

/**
 * Reads logs from an HTTP(S) URL, with gzip support.
 */
export class URLSourceReader extends AbstractSourceReader {
  constructor(url, options = {}) {
    super(`url:${url}`);
    this.url = new URL(url);
    const { maxAge = 30000, maxSize } = options;
    this.chunker = new Chunker(this.sourceId, maxAge, maxSize, 'url');
    this.chunker.on('chunk', (chunk) => this.emit('chunk', chunk));
  }

  async start() {
    if (this.running) return;
    this.running = true;

    const maxRetries = 3;
    let attempt = 0;
    let bytesRead = 0;

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    const fetchAndStream = async () => {
      try {
        const headers = bytesRead > 0 ? { Range: `bytes=${bytesRead}-` } : {};
        LOG.info(`🌐 [collector/url] Fetching ${this.url} (attempt ${attempt + 1}, offset ${bytesRead})`);

        const response = await fetch(this.url, { headers });
      if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
      }

      let stream = response.body;
      if (this.url.pathname.endsWith('.gz')) {
        stream = stream.pipe(zlib.createGunzip());
      }

      const rl = readline.createInterface({ input: stream });

      rl.on('line', (line) => {
          bytesRead += Buffer.byteLength(line, 'utf8') + 1; // include newline
        this.chunker.feed(line + '\n');
      });

      rl.on('close', () => {
        LOG.info(`🔚 [collector/url] Finished reading from ${this.url}`);
        this.emit('end');
      });

        stream.on('error', async (err) => {
          LOG.error('💥 [collector/url] Stream error', { error: err.message });
          collectorSourceErrorsTotal.inc({ source_type: 'url' });
          if (attempt < maxRetries) {
            attempt += 1;
            await delay(1000 * attempt);
            await fetchAndStream();
          } else {
            this.emit('error', err);
          }
        });
    } catch (error) {
        LOG.error('💥 [collector/url] Fetch failed', { error: error.message });
      collectorSourceErrorsTotal.inc({ source_type: 'url' });
        if (attempt < maxRetries) {
          attempt += 1;
          await delay(1000 * attempt);
          await fetchAndStream();
        } else {
      this.emit('error', error);
  }
      }
    };

    await fetchAndStream();
  }

  async stop() {
    if (!this.running) return;
    this.running = false;
    this.chunker.destroy();
    LOG.info(`🛑 [collector/url] Stopped reading from ${this.url}`);
  }
} 
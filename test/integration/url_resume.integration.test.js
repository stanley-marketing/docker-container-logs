import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { createServer } from 'http';
import { LogCollector } from '../../src/collector.js';

let PORT = 0;
const CONTENT = 'line1\nline2\nline3\n';
const TOTAL_BYTES = Buffer.byteLength(CONTENT);

let server;

beforeAll(async () => {
  let servedFirstHalf = false;

  server = createServer((req, res) => {
    const rangeHeader = req.headers.range;
    let start = 0;

    if (rangeHeader) {
      // format: bytes=<start>-<end?>
      const match = /bytes=(\d+)-/.exec(rangeHeader);
      if (match) start = Number(match[1]);
    }

    // Decide what to send
    let payload;
    if (!servedFirstHalf) {
      // First request – send first half
      const half = Math.floor(TOTAL_BYTES / 2);
      payload = Buffer.from(CONTENT.slice(0, half));
      servedFirstHalf = true;
    } else {
      // Subsequent request – send remainder from start offset
      payload = Buffer.from(CONTENT.slice(start));
    }

    const end = start + payload.length - 1;
    res.writeHead(206, {
      'Content-Type': 'text/plain',
      'Content-Range': `bytes ${start}-${end}/${TOTAL_BYTES}`,
      'Content-Length': payload.length
    });
    res.end(payload);
  });

  await new Promise(resolve => {
    server.listen(0, () => {
      // @ts-ignore
      PORT = server.address().port;
      resolve();
    });
  });
});

afterAll(() => {
  server.close();
});

describe('URLSourceReader range-resume', () => {
  it.skip('should resume download after interruption and deliver full content', { timeout: 15000 }, async () => {
    const collector = new LogCollector();
    const chunks = [];
    collector.on('chunk', (c) => chunks.push(c));

    await collector.start({ url: `http://localhost:${PORT}/logs` });

    // Poll until we have all bytes or timeout
    const startTime = Date.now();
    while (Date.now() - startTime < 5000) {
      const combined = chunks.map((c) => c.content).join('');
      if (Buffer.byteLength(combined) >= TOTAL_BYTES) {
        break;
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    // Flush any residual buffer
    collector.sourceReaders.forEach((r) => r.chunker._flush('manual'));

    const combined = chunks.map((c) => c.content).join('');
    expect(Buffer.byteLength(combined)).toBeGreaterThanOrEqual(TOTAL_BYTES);
    expect(combined).toContain('line3');

    await collector.stop();
  });
}); 
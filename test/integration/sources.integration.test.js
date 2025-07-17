import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LogCollector } from '../../src/collector.js';
import fs from 'fs';
import { createServer } from 'http';
import zlib from 'zlib';

const TEST_LOG_FILE = 'test.log';
const TEST_GZ_FILE = 'test.log.gz';

beforeAll(() => {
  // Create a dummy log file
  fs.writeFileSync(TEST_LOG_FILE, 'line 1\nline 2\n');
  
  // Create a gzipped version
  const fileContents = fs.readFileSync(TEST_LOG_FILE);
  fs.writeFileSync(TEST_GZ_FILE, zlib.gzipSync(fileContents));
});

afterAll(() => {
  fs.unlinkSync(TEST_LOG_FILE);
  fs.unlinkSync(TEST_GZ_FILE);
});

describe('File and URL Source Integration', () => {

  it('should read from a file source', { timeout: 15000 }, async () => {
    const collector = new LogCollector();
    const chunkPromise = new Promise(resolve => collector.on('chunk', resolve));
    
    await collector.start({ file: TEST_LOG_FILE, follow: false });
    
    // Give the collector a moment to read the file
    await new Promise(r => setTimeout(r, 100));
    
    // Manually flush the chunker
    const reader = collector.sourceReaders.values().next().value;
    reader.chunker._flush('manual');

    const chunk = await chunkPromise;
    expect(chunk.content).toContain('line 1');
    expect(chunk.content).toContain('line 2');
    await collector.stop();
  });
  
  it('should read from a URL source (gzipped)', { timeout: 15000 }, async () => {
    const server = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/gzip' });
      fs.createReadStream(TEST_GZ_FILE).pipe(res);
    });
    
    let port;
    await new Promise(resolve => server.listen(0, () => {
      // @ts-ignore
      port = server.address().port;
      resolve();
    }));
    
    const collector = new LogCollector();
    const chunkPromise = new Promise(resolve => collector.on('chunk', resolve));
    
    await collector.start({ url: `http://localhost:${port}/test.log.gz` });
    
    // Give the collector a moment to read the stream
    await new Promise(r => setTimeout(r, 100));

    // Manually flush the chunker
    const reader = collector.sourceReaders.values().next().value;
    reader.chunker._flush('manual');

    const chunk = await chunkPromise;
    expect(chunk.content).toContain('line 1');
    expect(chunk.content).toContain('line 2');
    
    await collector.stop();
    await new Promise(resolve => server.close(resolve));
  });
}); 
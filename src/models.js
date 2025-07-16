/**
 * 📦 Database Models & Schema
 * 
 * SQLite database setup using better-sqlite3 with prepared statements
 * for chunks and summaries persistence.
 */

import Database from 'better-sqlite3';
import { logger } from './utils/logger.js';

const LOG = logger.child({ module: 'models' });

/**
 * Database connection and schema management
 */
export class DatabaseManager {
  constructor(dbPath = 'data/docker-logs.db', options = {}) {
    this.dbPath = dbPath;
    this.db = null;
    this.options = {
      verbose: options.verbose ? console.log : null,
      ...options
    };
  }

  /**
   * Initialize database connection and create schema
   */
  async initialize() {
    try {
      LOG.info('🗄️ [models] Initializing database', { path: this.dbPath });
      
      this.db = new Database(this.dbPath, this.options);
      
      // Enable foreign key constraints
      this.db.pragma('foreign_keys = ON');
      
      // Create tables
      this._createSchema();
      
      // Prepare statements
      this._prepareStatements();
      
      LOG.info('✅ [models] Database initialized successfully');
    } catch (error) {
      LOG.error('💥 [models] Failed to initialize database', { error: error.message });
      throw error;
    }
  }

  /**
   * Create database schema matching Architecture doc
   */
  _createSchema() {
    const chunksTable = `
      CREATE TABLE IF NOT EXISTS chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        container TEXT NOT NULL,
        ts_start TIMESTAMP NOT NULL,
        ts_end TIMESTAMP NOT NULL,
        raw_path TEXT,
        size_bytes INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const summariesTable = `
      CREATE TABLE IF NOT EXISTS summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chunk_id INTEGER NOT NULL,
        summary TEXT NOT NULL,
        tokens_in INTEGER NOT NULL,
        tokens_out INTEGER NOT NULL,
        cost_usd REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chunk_id) REFERENCES chunks(id) ON DELETE CASCADE
      )
    `;

    const qaTable = `
      CREATE TABLE IF NOT EXISTS qa_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chunk_id INTEGER,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        tokens_in INTEGER NOT NULL,
        tokens_out INTEGER NOT NULL,
        cost_usd REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chunk_id) REFERENCES chunks(id) ON DELETE SET NULL
      )
    `;

    // Create indexes for performance
    const chunksIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_chunks_container ON chunks(container)',
      'CREATE INDEX IF NOT EXISTS idx_chunks_ts_start ON chunks(ts_start)',
      'CREATE INDEX IF NOT EXISTS idx_chunks_ts_end ON chunks(ts_end)'
    ];

    const summariesIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_summaries_chunk_id ON summaries(chunk_id)',
      'CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON summaries(created_at)'
    ];

    try {
      this.db.exec(chunksTable);
      this.db.exec(summariesTable);
      this.db.exec(qaTable);
      
      chunksIndexes.forEach(sql => this.db.exec(sql));
      summariesIndexes.forEach(sql => this.db.exec(sql));
      
      LOG.info('📋 [models] Database schema created successfully');
    } catch (error) {
      LOG.error('💥 [models] Failed to create schema', { error: error.message });
      throw error;
    }
  }

  /**
   * Prepare reusable SQL statements for performance
   */
  _prepareStatements() {
    try {
      // Chunk operations
      this.statements = {
        insertChunk: this.db.prepare(`
          INSERT INTO chunks (container, ts_start, ts_end, raw_path, size_bytes)
          VALUES (?, ?, ?, ?, ?)
        `),
        
        getChunk: this.db.prepare('SELECT * FROM chunks WHERE id = ?'),
        
        getChunksByContainer: this.db.prepare(`
          SELECT * FROM chunks 
          WHERE container = ? 
          ORDER BY ts_start DESC 
          LIMIT ?
        `),

        // Summary operations
        insertSummary: this.db.prepare(`
          INSERT INTO summaries (chunk_id, summary, tokens_in, tokens_out, cost_usd)
          VALUES (?, ?, ?, ?, ?)
        `),
        
        getSummary: this.db.prepare('SELECT * FROM summaries WHERE id = ?'),
        
        getSummariesByChunk: this.db.prepare(`
          SELECT * FROM summaries WHERE chunk_id = ? ORDER BY created_at DESC
        `),

        // QA operations
        insertQA: this.db.prepare(`
          INSERT INTO qa_sessions (chunk_id, question, answer, tokens_in, tokens_out, cost_usd)
          VALUES (?, ?, ?, ?, ?, ?)
        `),

        // Combined queries
        getChunkWithSummaries: this.db.prepare(`
          SELECT 
            c.*,
            s.id as summary_id,
            s.summary,
            s.tokens_in,
            s.tokens_out,
            s.cost_usd,
            s.created_at as summary_created_at
          FROM chunks c
          LEFT JOIN summaries s ON c.id = s.chunk_id
          WHERE c.id = ?
          ORDER BY s.created_at DESC
        `),

        // Statistics
        getTotalCost: this.db.prepare('SELECT SUM(cost_usd) as total_cost FROM summaries'),
        getTotalTokens: this.db.prepare(`
          SELECT 
            SUM(tokens_in) as total_tokens_in,
            SUM(tokens_out) as total_tokens_out
          FROM summaries
        `)
      };

      LOG.info('🔧 [models] Prepared statements created successfully');
    } catch (error) {
      LOG.error('💥 [models] Failed to prepare statements', { error: error.message });
      throw error;
    }
  }

  /**
   * Insert a new log chunk
   * @param {Object} chunk - Chunk data
   * @returns {number} - Inserted chunk ID
   */
  insertChunk(chunk) {
    try {
      const result = this.statements.insertChunk.run(
        chunk.container,
        chunk.tsStart,
        chunk.tsEnd,
        chunk.rawPath || null,
        chunk.sizeBytes
      );
      
      LOG.debug('📥 [models] Chunk inserted', { chunkId: result.lastInsertRowid });
      return result.lastInsertRowid;
    } catch (error) {
      LOG.error('💥 [models] Failed to insert chunk', { error: error.message });
      throw error;
    }
  }

  /**
   * Insert a new summary
   * @param {Object} summary - Summary data
   * @returns {number} - Inserted summary ID
   */
  insertSummary(summary) {
    try {
      const result = this.statements.insertSummary.run(
        summary.chunkId,
        JSON.stringify(summary.summary), // Store as JSON string
        summary.tokensIn,
        summary.tokensOut,
        summary.costUsd
      );
      
      LOG.debug('💾 [models] Summary inserted', { 
        summaryId: result.lastInsertRowid,
        chunkId: summary.chunkId,
        costUsd: summary.costUsd
      });
      
      return result.lastInsertRowid;
    } catch (error) {
      LOG.error('💥 [models] Failed to insert summary', { 
        chunkId: summary.chunkId,
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Insert a new QA session
   * @param {Object} qaSession - QA session data
   * @returns {number} - Inserted QA session ID
   */
  insertQA(qaSession) {
    try {
      const result = this.statements.insertQA.run(
        qaSession.chunkId,
        qaSession.question,
        qaSession.answer,
        qaSession.tokensIn,
        qaSession.tokensOut,
        qaSession.costUsd
      );
      
      LOG.debug('💾 [models] QA session inserted', { 
        qaSessionId: result.lastInsertRowid,
        chunkId: qaSession.chunkId,
        costUsd: qaSession.costUsd
      });
      
      return result.lastInsertRowid;
    } catch (error) {
      LOG.error('💥 [models] Failed to insert QA session', { 
        chunkId: qaSession.chunkId,
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get chunk by ID
   * @param {number} id - Chunk ID
   * @returns {Object|null} - Chunk data
   */
  getChunk(id) {
    try {
      const chunk = this.statements.getChunk.get(id);
      return chunk || null;
    } catch (error) {
      LOG.error('💥 [models] Failed to get chunk', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Get chunk with all summaries
   * @param {number} id - Chunk ID
   * @returns {Object|null} - Chunk with summaries
   */
  getChunkWithSummaries(id) {
    try {
      const rows = this.statements.getChunkWithSummaries.all(id);
      
      if (rows.length === 0) {
        return null;
      }

      // Transform results into structured object
      const chunk = {
        id: rows[0].id,
        container: rows[0].container,
        tsStart: rows[0].ts_start,
        tsEnd: rows[0].ts_end,
        rawPath: rows[0].raw_path,
        sizeBytes: rows[0].size_bytes,
        createdAt: rows[0].created_at,
        summaries: []
      };

      // Add summaries if they exist
      rows.forEach(row => {
        if (row.summary_id) {
          chunk.summaries.push({
            id: row.summary_id,
            summary: JSON.parse(row.summary),
            tokensIn: row.tokens_in,
            tokensOut: row.tokens_out,
            costUsd: row.cost_usd,
            createdAt: row.summary_created_at
          });
        }
      });

      return chunk;
    } catch (error) {
      LOG.error('💥 [models] Failed to get chunk with summaries', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Get usage statistics
   * @returns {Object} - Cost and token statistics
   */
  getUsageStats() {
    try {
      const costResult = this.statements.getTotalCost.get();
      const tokenResult = this.statements.getTotalTokens.get();
      
      return {
        totalCostUsd: costResult.total_cost || 0,
        totalTokensIn: tokenResult.total_tokens_in || 0,
        totalTokensOut: tokenResult.total_tokens_out || 0
      };
    } catch (error) {
      LOG.error('💥 [models] Failed to get usage stats', { error: error.message });
      throw error;
    }
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      LOG.info('🔒 [models] Database connection closed');
    }
  }

  /**
   * Get database info for health checks
   */
  getHealth() {
    try {
      const result = this.db.prepare('SELECT COUNT(*) as chunk_count FROM chunks').get();
      const summaryResult = this.db.prepare('SELECT COUNT(*) as summary_count FROM summaries').get();
      
      return {
        status: 'healthy',
        chunkCount: result.chunk_count,
        summaryCount: summaryResult.summary_count,
        dbPath: this.dbPath
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Singleton instance for application use
export const db = new DatabaseManager(); 
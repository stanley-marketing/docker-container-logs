/**
 * 🧠 Gemini AI Client
 * 
 * Handles communication with Google Gemini API for log summarisation
 * with structured prompt templates, response parsing, and retry logic.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from './utils/logger.js';
import { geminiRequestSeconds, geminiTokensTotal, geminiCostUsdTotal } from './metrics.js';

const LOG = logger.child({ module: 'gemini' });

/**
 * Prompt template for log chunk summarisation
 */
const SUMMARISATION_PROMPT = `
You are an expert log analyst. Analyze the following log chunk and provide a structured summary.

Log Chunk:
Container: {containerId}
Time Range: {tsStart} to {tsEnd}
Size: {sizeBytes} bytes
Content:
{content}

Respond with ONLY a valid JSON object in this exact format:
{
  "what_happened": "Brief description ≤ 100 characters",
  "key_events": [
    "Important event 1",
    "Important event 2"
  ],
  "open_questions": [
    "Question about unclear behavior 1",
    "Question about potential issue 2"
  ]
}

Rules:
- what_happened MUST be ≤ 100 characters
- key_events should be 2-5 most important events
- open_questions should identify unclear behaviors or potential issues
- Response must be valid JSON only, no other text
`.trim();

/**
 * Retry configuration for exponential back-off
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000, // 1 second base delay
  maxDelayMs: 8000,  // 8 second max delay
  retryableStatusCodes: [429, 500, 502, 503, 504] // 429 rate limit + 5xx server errors
};

/**
 * Gemini API client wrapper
 */
export class GeminiClient {
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: options.model || 'gemini-1.5-flash' 
    });
    this.requestTimeout = options.requestTimeout ?? options.timeout ?? 30000; // 30 seconds
    this.timeout = this.requestTimeout; // Internal timeout
    this.retryConfig = { ...RETRY_CONFIG, ...options.retry };
  }

  /**
   * Build prompt from template with chunk data
   * @param {Object} chunk - Log chunk data
   * @returns {string} - Formatted prompt
   */
  _buildPrompt(chunk) {
    return SUMMARISATION_PROMPT
      .replace('{containerId}', chunk.containerId || 'unknown')
      .replace('{tsStart}', chunk.tsStart || 'unknown')
      .replace('{tsEnd}', chunk.tsEnd || 'unknown')
      .replace('{sizeBytes}', chunk.sizeBytes || 0)
      .replace('{content}', chunk.content || '');
  }

  /**
   * Parse and validate Gemini response
   * @param {string} responseText - Raw response from Gemini
   * @param {string} chunkId - Chunk ID for logging
   * @returns {Object} - Parsed and validated summary
   */
  _parseResponse(responseText, chunkId) {
    try {
      LOG.debug('🔍 [gemini] Parsing response', { 
        chunkId, 
        responseLength: responseText.length 
      });

      // Handle markdown-wrapped JSON
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json') && jsonText.endsWith('```')) {
        jsonText = jsonText.slice(7, -3).trim(); // Remove ```json and ```
      } else if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
        jsonText = jsonText.slice(3, -3).trim(); // Remove ``` and ```
      }

      const response = JSON.parse(jsonText);

      // Validate required fields
      const requiredFields = ['what_happened', 'key_events', 'open_questions'];
      const missingFields = requiredFields.filter(field => !(field in response));
      
      if (missingFields.length > 0) {
        throw new Error('Response missing required fields');
      }

      // Validate and truncate what_happened if needed
      if (response.what_happened.length > 100) {
        LOG.warn('⚠️ [gemini] what_happened exceeds 100 chars, truncating', { 
          length: response.what_happened.length 
        });
        response.what_happened = response.what_happened.substring(0, 97) + '...';
      }

      // Ensure arrays are arrays
      if (!Array.isArray(response.key_events)) {
        response.key_events = [];
      }
      if (!Array.isArray(response.open_questions)) {
        response.open_questions = [];
      }

      return response;
    } catch (error) {
      LOG.error('💥 [gemini] Failed to parse response', { 
        error: error.message, 
        responseText 
      });
      throw new Error(`Invalid JSON response: ${error.message}`);
    }
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} - Promise that resolves after delay
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate exponential back-off delay
   * @param {number} attempt - Current attempt number (0-based)
   * @returns {number} - Delay in milliseconds
   */
  _calculateDelay(attempt) {
    const delay = this.retryConfig.baseDelayMs * Math.pow(2, attempt);
    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} - Whether error should be retried
   */
  _isRetryableError(error) {
    // Check if error is request timeout
    if (/request timeout/i.test(error.message)) {
      return false;
    }
    
    // Check for HTTP status codes in error message
    const statusMatch = error.message.match(/status\s*:?\s*(\d+)/i);
    if (statusMatch) {
      const statusCode = parseInt(statusMatch[1]);
      return this.retryConfig.retryableStatusCodes.includes(statusCode);
    }

    // Check for common retryable error patterns
    const retryablePatterns = [
      /rate limit/i,
      /too many requests/i,
      /server error/i,
      /service unavailable/i,
      /timeout/i,
      /connection reset/i,
      /temporarily unavailable/i
    ];

    return retryablePatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Summarise log chunk with retry logic and exponential back-off
   * @param {Object} chunk - Log chunk data
   * @returns {Promise<Object>} - Summary result with metrics
   */
  async summarise(chunk) {
    const chunkId = chunk.chunkId || 'unknown';
    const startTime = Date.now();
    let lastError = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        // Log attempt info
        if (attempt > 0) {
          LOG.info('🔄 [gemini] Retrying request', { 
            chunkId, 
            attempt, 
            maxRetries: this.retryConfig.maxRetries 
          });
        } else {
          LOG.info('🧠 [gemini] Sending chunk to Gemini', { 
            chunkId, 
            sizeBytes: chunk.sizeBytes 
          });
        }

        const prompt = this._buildPrompt(chunk);
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), this.timeout);
        });

        // Make API call with timeout
        const apiPromise = this.model.generateContent(prompt);
        const result = await Promise.race([apiPromise, timeoutPromise]);
        
        const responseText = result.response.text();
        const summary = this._parseResponse(responseText, chunkId);

        // Extract token usage if available
        const usage = result.response.usageMetadata || {};
        const tokensIn = usage.promptTokenCount || 0;
        const tokensOut = usage.candidatesTokenCount || 0;
        
        // Calculate cost (approximate pricing for Gemini 1.5 Flash)
        const costPerInputToken = 0.00000015; // $0.15 per 1M tokens
        const costPerOutputToken = 0.0000006; // $0.60 per 1M tokens
        const costUsd = (tokensIn * costPerInputToken) + (tokensOut * costPerOutputToken);

        const duration = Date.now() - startTime;
        const durationSec = duration / 1000;
        geminiRequestSeconds.observe(durationSec);
        geminiTokensTotal.inc(tokensIn + tokensOut);
        geminiCostUsdTotal.inc(costUsd);
        
        LOG.info('✅ [gemini] Successfully summarised chunk', { 
          chunkId, 
          tokensIn, 
          tokensOut, 
          costUsd: costUsd.toFixed(6),
          duration,
          attempt: attempt > 0 ? attempt : undefined
        });

        return {
          chunkId,
          summary,
          tokensIn,
          tokensOut,
          totalTokens: tokensIn + tokensOut,
          costUsd,
          duration,
          tokenUsage: {
            tokensIn,
            tokensOut,
            totalTokens: tokensIn + tokensOut,
            costUsd
          }
        };

      } catch (error) {
        lastError = error;
        const duration = Date.now() - startTime;
        
        // Check if we should retry
        const shouldRetry = attempt < this.retryConfig.maxRetries && this._isRetryableError(error);
        
        if (shouldRetry) {
          const delay = this._calculateDelay(attempt);
          
          LOG.warn('⚠️ [gemini] Request failed, will retry', { 
            chunkId, 
            attempt: attempt + 1, 
            maxRetries: this.retryConfig.maxRetries,
            error: error.message,
            retryDelayMs: delay,
            duration
          });
          
          // Wait before retrying
          await this._sleep(delay);
        } else {
          // Final failure - log and throw
          LOG.error('💥 [gemini] Failed to summarise chunk', { 
            chunkId, 
            duration,
            attempt: attempt + 1,
            error: error.message
          });
          
          throw error;
        }
      }
    }

    // This should never be reached, but just in case
    throw lastError || new Error('Maximum retries exceeded');
  }

  /**
   * Extract token usage from response metadata
   * @param {Object} result - Gemini API result
   * @returns {Object} - Token usage data
   */
  _extractTokenUsage(result) {
    try {
      const usage = result.response.usageMetadata || {};
      return {
        tokensIn: usage.promptTokenCount || 0,
        tokensOut: usage.candidatesTokenCount || 0,
        totalTokens: usage.totalTokenCount || 0,
        costUsd: this._calculateCost(usage.promptTokenCount || 0, usage.candidatesTokenCount || 0)
      };
    } catch (error) {
      LOG.warn('⚠️ [gemini] Failed to extract token usage', { error: error.message });
      return { tokensIn: 0, tokensOut: 0, totalTokens: 0, costUsd: 0 };
    }
  }

  /**
   * Calculate cost based on token usage
   * @param {number} tokensIn - Input tokens
   * @param {number} tokensOut - Output tokens  
   * @returns {number} - Cost in USD
   */
  _calculateCost(tokensIn, tokensOut) {
    const costPerInputToken = 0.00000015; // $0.15 per 1M tokens
    const costPerOutputToken = 0.0000006; // $0.60 per 1M tokens
    return (tokensIn * costPerInputToken) + (tokensOut * costPerOutputToken);
  }

  /**
   * Alias for summarise method (for test compatibility)
   * @param {Object} chunk - Log chunk data
   * @returns {Promise<Object>} - Summary result with metrics
   */
  async summariseChunk(chunk) {
    return this.summarise(chunk);
  }

  /**
   * Test connection to Gemini API
   * @returns {Promise<boolean>} - True if connection successful
   */
  async testConnection() {
    try {
      const testChunk = {
        chunkId: 'test-connection',
        containerId: 'test',
        tsStart: new Date().toISOString(),
        tsEnd: new Date().toISOString(),
        sizeBytes: 10,
        content: 'Test log line'
      };

      await this.summarise(testChunk);
      LOG.info('✅ [gemini] Connection test successful');
      return true;

    } catch (error) {
      LOG.error('💥 [gemini] Connection test failed', { error: error.message });
      return false;
    }
  }
}

export default GeminiClient; 
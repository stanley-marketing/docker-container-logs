/**
 * 📈 Prometheus Metrics Utility
 *
 * Exports a shared Prometheus Registry and preconfigured metrics
 * for Gemini requests.
 */

import { Registry, Histogram, Counter, collectDefaultMetrics } from 'prom-client';

// Create single registry for the process
export const metricsRegistry = new Registry();

// Collect Node.js default metrics (memory, event loop, etc.)
collectDefaultMetrics({ register: metricsRegistry });

// Histogram for Gemini request durations
export const geminiRequestSeconds = new Histogram({
  name: 'gemini_request_seconds_histogram',
  help: 'Gemini request latency in seconds',
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry]
});

// Counter for total Gemini tokens (input + output)
export const geminiTokensTotal = new Counter({
  name: 'gemini_tokens_total',
  help: 'Total Gemini tokens consumed',
  registers: [metricsRegistry]
});

// Counter for total Gemini cost in USD
export const geminiCostUsdTotal = new Counter({
  name: 'gemini_cost_usd_total',
  help: 'Total cost incurred for Gemini usage in USD',
  registers: [metricsRegistry]
});

// Counter for total log lines ingested
export const logLinesTotal = new Counter({
  name: 'log_lines_total',
  help: 'Total number of log lines ingested',
  registers: [metricsRegistry]
});

// Counter for collector source errors
export const collectorSourceErrorsTotal = new Counter({
  name: 'collector_source_errors_total',
  help: 'Total number of errors encountered by log sources',
  labelNames: ['source_type'],
  registers: [metricsRegistry]
});

export function metricsMiddleware(req, res) {
  res.setHeader('Content-Type', metricsRegistry.contentType);
  metricsRegistry.metrics().then((data) => {
    res.end(data);
  });
} 
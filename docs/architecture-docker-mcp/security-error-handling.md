# Security & Error Handling
* Docker socket mounted **read-only**.
* Secrets redaction regex list configurable; executed before Gemini call.
* Gemini 429/5xx → exponential back-off (1 → 32 s) then circuit-break 5 min.
* JWT-based auth middleware on REST; CLI can use `--token` or env var.
* Graceful SIGTERM: drains buffers, flushes DB, closes Gemini sessions.

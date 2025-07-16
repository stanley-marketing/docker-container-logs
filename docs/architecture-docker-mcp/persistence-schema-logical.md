# Persistence Schema (logical)
```text
chunks (
  id PK, container TEXT, ts_start TIMESTAMP, ts_end TIMESTAMP,
  raw_path TEXT, size_bytes INT
)

summaries (
  id PK, chunk_id FK, summary TEXT,
  tokens_in INT, tokens_out INT, cost_usd NUMERIC,
  created_at TIMESTAMP DEFAULT now()
)
```

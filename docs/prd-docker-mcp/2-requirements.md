# 2. Requirements
## 2.1 Functional (FR)
1. **FR1** List running containers and allow selection (flags: `--all`, `--label`).
2. **FR2** Stream both _stdout_ & _stderr_; auto-reattach after restart.
3. **FR3** Chunk logs by 30-second window **or** when size > 8 KB.
4. **FR4** Send each chunk to Gemini; receive summary with: TL;DR, anomalies, open questions.
5. **FR5** Persist summary + metadata (container, ts_start, ts_end, token_cost).
6. **FR6** Expose CLI / REST API to list, search, and fetch summaries & raw chunks.
7. **FR7** Let users ask follow-up questions; system feeds context back to Gemini and returns answer.
8. **FR8** Redact secrets (AWS keys, tokens, hex ≥ 12 chars) before LLM calls.
9. **FR9** Export Prometheus metrics: chunk rate, LLM latency, daily cost.
10. **FR10** Graceful shutdown saves in-flight buffers.

## 2.2 Non-Functional (NFR)
1. **NFR1** Install via `npm install -g docker-log-summariser`; Node.js 20+.
2. **NFR2** Resource envelope: CPU < 100 milli-cores, RAM < 150 MB for 10 containers @ 200 lps each.
3. **NFR3** SQLite default via better-sqlite3; Postgres optional via pg driver.
4. **NFR4** Outbound traffic limited to Gemini endpoint (configurable proxy).
5. **NFR5** CLI operations P95 < 200 ms; REST latency P95 < 200 ms for summary fetch.
6. **NFR6** ≥ 80 % unit coverage; integration tests with Docker-in-Docker.

## 2.3 Constraints & Assumptions
* Host grants read-only access to `/var/run/docker.sock`.
* Internet egress mandatory for Gemini; offline mode out-of-scope for MVP.
* English logs only in v1; localisation deferred.

---

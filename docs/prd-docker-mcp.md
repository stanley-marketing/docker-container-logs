# Docker Log Summariser MCP – Product Requirements Document (PRD)

## 1. Goals and Background
The Docker Log Summariser MCP provides lightning-fast situational awareness for engineers operating Docker-based services. By continuously summarising verbose container logs with Gemini every _N_ seconds, the tool reduces mean-time-to-resolve incidents by surfacing key events, anomalies, and unanswered questions.

* **Primary Outcome:** ≥ 30 % MTTR reduction for pilot teams.
* **Context:** Micro-services generate torrents of JSON and stack-trace logs; manual `tail -f | grep` analysis is slow and error-prone.

---

## 2. Requirements
### 2.1 Functional (FR)
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

### 2.2 Non-Functional (NFR)
1. **NFR1** Install via `pipx install docker-log-summariser`; Python 3.10+.
2. **NFR2** Resource envelope: CPU < 100 milli-cores, RAM < 150 MB for 10 containers @ 200 lps each.
3. **NFR3** SQLite default; Postgres optional via SQLAlchemy.
4. **NFR4** Outbound traffic limited to Gemini endpoint (configurable proxy).
5. **NFR5** CLI operations P95 < 200 ms; REST latency P95 < 200 ms for summary fetch.
6. **NFR6** ≥ 80 % unit coverage; integration tests with Docker-in-Docker.

### 2.3 Constraints & Assumptions
* Host grants read-only access to `/var/run/docker.sock`.
* Internet egress mandatory for Gemini; offline mode out-of-scope for MVP.
* English logs only in v1; localisation deferred.

---

## 3. Success Criteria / KPIs
| # | Metric | Target |
|---|--------|--------|
| 1 | MTTR improvement (pilot) | ≥ 30 % |
| 2 | User-rated usefulness of summaries | ≥ 90 % positive |
| 3 | Resource usage under stress | Meets NFR2 |
| 4 | Lost chunks during 24 h soak | 0 |
| 5 | Install time on fresh host | ≤ 2 minutes |

---

## 4. User Stories (Illustrative)
1. **As an SRE**, I can list containers and pick one emitting errors so I can focus summaries on it.
2. **As a developer**, I receive a one-line TL;DR every 30 s while coding so I avoid sifting through verbose logs.
3. **As an on-call engineer**, I ask _“why did payment-service crash at 02:15?”_ and get an answer within 10 s.
4. **As a security lead**, I rely on secrets redaction so credentials never leave the host.
5. **As a team lead**, I track Prometheus metrics to tune chunk size and cost.

---

## 5. Open Questions
1. Expected peak log throughput & concurrent container count?
2. Preferred storage tier for production (SQLite vs Postgres)?
3. Retention policy for raw chunks vs summaries?
4. Authentication model for REST API (JWT, mTLS)?
5. Priority for multi-language summarisation?

---

## 6. Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-07-16 | 0.1 | Initial draft PRD | John (PM) | 
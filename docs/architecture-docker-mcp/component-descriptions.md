# Component Descriptions
| ID | Component | Responsibilities |
|----|-----------|------------------|
| LC | **Log Collector** | Attaches to selected containers using dockerode; streams _stdout_ & _stderr_; handles restart & rotation; pushes raw lines to Chunker. |
| CH | **Chunker / Pre-Processor** | Buffers lines; strips ANSI; redacts secrets; emits chunk every 30 s or when size > 8 KB. |
| SUM | **Gemini Summariser Worker** | Consumes chunks; sends prompt to Gemini; records summary, token usage, cost; retries with back-off. |
| DB | **Persistence Layer** | SQLite (file) by default; Postgres via SQLAlchemy for multi-node; full-text search on summaries. |
| API | **Query Interface** | Fastify REST plus yargs CLI wrapper; endpoints: `/summaries`, `/chunks/{id}`, `/ask`; secures via JWT. |
| UserCLI | **User Client / MCP** | Human or programmatic caller; browses summaries, runs follow-up questions. |

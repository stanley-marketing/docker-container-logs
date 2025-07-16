# Technology Stack
* **Language / Runtime:** Python 3.12, asyncio.
* **Docker SDK:** `docker==7.x` (docker-py) for log streaming.
* **Web / CLI:** FastAPI for REST; Typer for CLI commands sharing same service layer.
* **Database:** SQLite (MVP) → Postgres option; SQLAlchemy ORM; `sqlite-fts5` for full-text search.
* **LLM:** Google Gemini via official SDK; exponential back-off & circuit-breaker wrapper.
* **Observability:** Prometheus client (`/metrics` endpoint); structured logs (`logfmt`).

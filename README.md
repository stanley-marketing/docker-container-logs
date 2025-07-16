# Docker Log Summariser MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight service that streams logs from Docker containers, local files, or URLs, summarises them with Google Gemini, and provides a queryable API for insights and Q&A.

## Features

- **Multiple Log Sources**: Stream logs from all running Docker containers, containers with specific labels, local log files (with `-f` support), or remote HTTP(S) URLs (with gzip support).
- **AI-Powered Summaries**: Automatically chunks logs and sends them to Google Gemini for a concise summary, including a TL;DR, key events, and open questions.
- **Interactive Q&A**: Ask follow-up questions about your logs via a simple REST API.
- **Secure by Default**: Redacts secrets (API keys, long hex strings) before sending data to the LLM. API endpoints are protected by JWT.
- **Observable**: Exposes Prometheus metrics for monitoring chunk rates, LLM latency, and costs.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- Docker (for container log streaming)
- A Google Gemini API Key

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/docker-log-summariser-mcp.git
    cd docker-log-summariser-mcp
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment:
    ```bash
    export GEMINI_API_KEY="your-gemini-api-key"
    export JWT_SECRET="a-very-secure-secret"
    ```

### Running the Service

The service is controlled via a single CLI entrypoint. You must specify one log source.

**Monitor all Docker containers:**
```bash
npm start -- --all
```

**Monitor containers with a specific label:**
```bash
npm start -- --label "app=my-app"
```

**Read from a local file and follow for new logs:**
```bash
npm start -- --file /path/to/your.log --follow
```

**Read from a remote URL:**
```bash
npm start -- --url https://example.com/logs.txt.gz
```

By default, the API server will start on port 8000.

## API Usage

The API is protected by JWT. Include your token in the `Authorization` header as a Bearer token.

- **GET /summaries**: List recent summaries.
  - Query Params: `limit`, `container`, `from`, `to`
- **GET /chunks/:id**: Get the raw content of a specific log chunk.
- **POST /ask**: Ask a follow-up question.
  - Body: `{ "question": "your question", "chunk_id": 123 }`
- **GET /health**: Health check endpoint.
- **GET /metrics**: Prometheus metrics.

An OpenAPI (Swagger) specification is available at the `/docs` endpoint.

## Helm Chart

A Helm chart is available in the `charts/` directory for deploying to Kubernetes.

```bash
helm install my-release ./charts/docker-log-summariser
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

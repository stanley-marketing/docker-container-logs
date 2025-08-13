### Build stage
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

### Production stage
FROM node:22-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy application with proper ownership
COPY --from=build --chown=appuser:appuser /app /app
COPY --chown=appuser:appuser NOTICE /app/

# Switch to non-root user
USER appuser

ENV NODE_ENV=production
EXPOSE 8000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "src/index.js"] 
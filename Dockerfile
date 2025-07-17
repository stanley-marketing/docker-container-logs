### Build stage
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

### Production stage
FROM node:22-slim
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
EXPOSE 8000
CMD ["node", "src/index.js"] 
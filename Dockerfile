# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files
COPY mini-vault/package.json ./mini-vault/
COPY cli/package.json ./cli/

# Install dependencies for both mini-vault and cli
RUN cd mini-vault && npm install
RUN cd cli && npm install

# Copy source code
COPY mini-vault/ ./mini-vault/
COPY cli/ ./cli/

# Create logs directory
RUN mkdir -p mini-vault/src/logs

# Expose the port the app runs on
EXPOSE 8000

# Set working directory to mini-vault for startup
WORKDIR /app/mini-vault

# Default Ollama URL (works with --network host)
ENV OLLAMA_URL=http://localhost:11434/api/chat

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/status || exit 1

# Install curl for healthcheck
RUN apk add --no-cache curl

# Start the application
CMD ["npm", "start"] 
# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY mini-vault/package.json ./mini-vault/
COPY cli/package.json ./cli/

# Install dependencies for both server and CLI
RUN cd mini-vault && npm install
RUN cd cli && npm install

# Copy source code
COPY mini-vault/ ./mini-vault/
COPY cli/ ./cli/

# Expose the server port
EXPOSE 8000

# Default command runs the server
CMD ["npm", "run", "start", "--prefix", "mini-vault"] 
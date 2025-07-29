# Mini Vault - Run LLMs Locally

A simple AI chat system that provides command-line interface for interacting with Ollama AI models locally.

## What does this project do?

This project consists of two main components:

1. **Server** (`mini-vault/`): An Express.js server that acts as a proxy to Ollama AI models
   - Provides `/generate` endpoint for AI text generation with streaming responses
   - Provides `/status` endpoint for system monitoring
   - Logs all conversations to JSONL files for later analysis

2. **CLI** (`cli/`): A command-line interface that connects to the server
   - Interactive chat interface for sending prompts to AI models
   - Real-time streaming responses
   - System status checking capabilities

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (recommended)
- [Ollama](https://ollama.ai/) running locally
- Node.js 18+ (if running without Docker)

## Quick Start with Docker (Simple & Recommended)

### Step 1: Setup Ollama

```bash
# Install and start Ollama (if not already done)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the required model
ollama pull smollm:135m

# Start Ollama (runs on localhost:11434)
ollama serve
```

### Step 2: Build and Run with Docker

```bash
# Build the image
docker build -t mini-vault .

# Run the server (with auto-restart if it crashes)
docker run --network host --restart unless-stopped mini-vault
```

That's it! The server runs on `localhost:8000`.

### Step 3: Use the CLI

In a new terminal:

```bash
# Install CLI dependencies (one-time setup)
cd cli && npm install

# Start the interactive CLI
npm start
```

## Alternative: Local Setup (No Docker)

If you prefer to run without Docker:

```bash
# Terminal 1: Run server locally
cd mini-vault && npm install && npm start

# Terminal 2: Run CLI
cd cli && npm install && npm start
```

### Step 4: Use the CLI

The CLI provides an interactive interface:

```
*Mini Vault CLI*
Type "exit" to quit, "status" to check system status.

> prompt: Hello, who are you?
> response: I'm a local AI model, running offline!

> prompt: status
> response:
=== SYSTEM STATUS ===
Timestamp: 2024-01-01T12:00:00.000Z
Server Status: running (Port: 8000)
...

> prompt: exit
```



## Available Commands in CLI

- **Any text prompt**: Sends the prompt to the AI model and streams the response
- **`status`**: Shows detailed system information about the server
- **`exit`**: Quit the CLI application

## Server Endpoints

- **POST `/generate`**: Send a prompt and receive streaming AI response
  ```json
  {
    "prompt": "Your question here"
  }
  ```

- **GET `/status`**: Get system status information including memory usage, uptime, and process details

## File Structure

```
mini-vault-assign/
├── Dockerfile              # Docker configuration for the server
├── .dockerignore           # Files to exclude from Docker build
├── README.md              # This file
├── mini-vault/            # Main server application
│   ├── package.json       # Server dependencies
│   └── src/
│       ├── index.ts       # Express server with AI proxy
│       └── logs/          # Conversation logs (auto-created)
└── cli/                   # Command-line interface
    ├── package.json       # CLI dependencies
    └── vault.js           # CLI application
```

## Configuration

- **AI Model**: Currently configured to use `smollm:135m` model
- **Server Port**: 8000 (configurable in `mini-vault/src/index.ts`)
- **Ollama URL**: Configurable via `OLLAMA_URL` environment variable
  - Default: `http://localhost:11434/api/chat` (for local development)
  - Docker: `http://host.docker.internal:11434/api/chat` (automatically set)
  - Custom: `docker run -e OLLAMA_URL=http://your-ollama-host:11434/api/chat -p 8000:8000 mini-vault`

## Logs

All conversations are automatically logged to `mini-vault/src/logs/log.jsonl` in JSON Lines format for analysis and review.

## Troubleshooting

1. **"Connection refused" or "fetch failed" errors**: 
   - Make sure Ollama is running: `ollama serve`
   - Check if the model exists: `ollama list`
   
2. **"Model not found" errors**: Run `ollama pull smollm:135m` to download the model

3. **Port already in use**: Make sure no other application is using port 8000

4. **Docker issues**: The `--network host` flag should solve all networking problems between Docker and Ollama

## Tradeoffs or Design Thoughts

- **Fetch over Axios**: Used native `fetch()` to avoid external dependencies and reduce bundle size while maintaining full control over streaming with `ReadableStream` API.
- **Streaming Responses**: Implemented real-time streaming to provide immediate user feedback as the AI generates text, improving perceived performance and user experience.
# Mini Vault - Dockerized AI Chat System

A complete AI chat system running Ollama with Mistral model, a streaming API server, and an interactive CLI - all in Docker containers.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available for Ollama

### One-Command Setup

```bash
# Start everything
./run.sh start

# Use the CLI (in a new terminal)
./run.sh cli
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `./run.sh start` | Start Ollama + Mini Vault server |
| `./run.sh cli` | Launch interactive CLI |
| `./run.sh status` | Check service status |
| `./run.sh logs` | View service logs |
| `./run.sh stop` | Stop all services |
| `./run.sh clean` | Stop and remove all data |

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mini Vault    │    │   Mini Vault     │    │     Ollama      │
│      CLI        │◄──►│     Server       │◄──►│   + Mistral     │
│  (Interactive)  │    │  (Port 8000)     │    │  (Port 11434)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🛠️ Services

### 1. **Ollama Service**
- Runs Ollama AI server with Mistral model
- Automatically pulls Mistral on first start
- Port: `11434`
- Persistent data storage

### 2. **Mini Vault Server**
- Node.js/Express API server
- Streaming AI responses
- System status endpoint
- Port: `8000`
- Logs saved to `./mini-vault/src/logs/`

### 3. **Mini Vault CLI**
- Interactive command-line interface
- Real-time streaming responses
- System status commands

## 📖 Usage Examples

### Starting the System
```bash
./run.sh start
```
This will:
1. Start Ollama container
2. Download Mistral model (~4GB)
3. Start the API server
4. Health checks ensure everything is running

### Using the CLI
```bash
./run.sh cli
```

In the CLI:
```
*Mini Vault CLI*
Type "exit" to quit, "status" to check system status.

> prompt: Hello, how are you?
> response: Hello! I'm doing well, thank you for asking...

> prompt: status
> response:
=== SYSTEM STATUS ===
📊 MEMORY USAGE:
  RSS: 45.67 MB
  Heap Total: 20.12 MB
⏱️ UPTIME:
  Duration: 0d 1h 23m 45s
💻 PROCESS INFO:
  Platform: linux
  Node Version: v18.17.0

> prompt: exit
```

### Direct API Access
```bash
# Get system status
curl http://localhost:8000/status

# Send a prompt
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello world"}'
```

## 🔍 Monitoring

### Check Service Health
```bash
./run.sh status
```

### View Real-time Logs
```bash
./run.sh logs
```

### Individual Service Logs
```bash
# Server logs
docker-compose logs mini-vault-server

# Ollama logs
docker-compose logs ollama
```

## 🐛 Troubleshooting

### Common Issues

**1. Ollama model download fails**
```bash
# Clean restart
./run.sh clean
./run.sh start
```

**2. Server not responding**
```bash
# Check if all services are running
./run.sh status

# View logs for errors
./run.sh logs
```

**3. Out of memory**
```bash
# Clean up Docker resources
./run.sh clean
docker system prune -f
```

### Port Conflicts
If ports 8000 or 11434 are in use, modify `docker-compose.yml`:
```yaml
ports:
  - "9000:8000"  # Change external port
```

## 🔧 Development

### Manual Docker Commands
```bash
# Build and start all services
docker-compose up -d

# Run CLI interactively
docker-compose run --rm mini-vault-cli

# Stop everything
docker-compose down
```

### File Structure
```
mini-vault-assign/
├── docker-compose.yml      # Multi-service orchestration
├── Dockerfile             # Node.js app container
├── run.sh                 # Helper script
├── mini-vault/            # API server
│   ├── src/index.ts       # Main server file
│   └── package.json
└── cli/                   # CLI tool
    ├── vault.js           # CLI implementation
    └── package.json
```

## 📊 Resource Requirements

- **RAM**: 4-6GB (Ollama needs ~3GB for Mistral)
- **Disk**: ~5GB (Docker images + model)
- **CPU**: 2+ cores recommended

## 🚦 Health Checks

All services include health checks:
- **Ollama**: API endpoint availability
- **Server**: `/status` endpoint response
- **Automatic restart** on failure

## 🔄 Updates

To update to the latest versions:
```bash
./run.sh stop
docker-compose pull
./run.sh start
```

---

**Enjoy your AI-powered Mini Vault! 🎉**

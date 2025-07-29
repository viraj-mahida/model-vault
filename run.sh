#!/bin/bash

# Mini Vault Docker Runner Script

case "$1" in
    "start")
        echo "🚀 Starting Mini Vault stack..."
        echo "This will:"
        echo "  - Start Ollama service"
        echo "  - Pull Mistral model (this may take a few minutes)"
        echo "  - Start Mini Vault server on port 8000"
        echo ""
        docker-compose up -d ollama mini-vault-server
        echo ""
        echo "✅ Services starting! Check status with: ./run.sh status"
        echo "📋 View logs with: ./run.sh logs"
        echo "🖥️  Use CLI with: ./run.sh cli"
        ;;
    
    "cli")
        echo "🖥️  Starting Mini Vault CLI..."
        echo "Type 'exit' to quit, 'status' to check system status"
        echo ""
        docker-compose run --rm mini-vault-cli
        ;;
    
    "status")
        echo "📊 Service Status:"
        docker-compose ps
        echo ""
        echo "🌐 Testing server health..."
        curl -s http://localhost:8000/status | grep -q "running" && echo "✅ Server is healthy" || echo "❌ Server not responding"
        ;;
    
    "logs")
        echo "📋 Recent logs:"
        docker-compose logs --tail=50 -f
        ;;
    
    "stop")
        echo "🛑 Stopping Mini Vault stack..."
        docker-compose down
        echo "✅ Services stopped"
        ;;
    
    "clean")
        echo "🧹 Cleaning up everything (including Ollama data)..."
        docker-compose down -v
        docker system prune -f
        echo "✅ Cleanup complete"
        ;;
    
    *)
        echo "🏗️  Mini Vault Docker Runner"
        echo ""
        echo "Usage: ./run.sh [command]"
        echo ""
        echo "Commands:"
        echo "  start   - Start Ollama + Mini Vault server"
        echo "  cli     - Launch the interactive CLI"
        echo "  status  - Check service status"
        echo "  logs    - View service logs"
        echo "  stop    - Stop all services"
        echo "  clean   - Stop services and remove data"
        echo ""
        echo "Quick start:"
        echo "  1. ./run.sh start"
        echo "  2. ./run.sh cli"
        ;;
esac 
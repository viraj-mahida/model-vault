#!/bin/bash

echo "🧪 Testing Mini Vault Docker Setup"
echo "=================================="

# Function to check if service is responding
check_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "🔍 Checking $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is responding"
            return 0
        fi
        
        echo "⏳ Attempt $attempt/$max_attempts - waiting for $service_name..."
        sleep 5
        ((attempt++))
    done
    
    echo "❌ $service_name failed to respond after $max_attempts attempts"
    return 1
}

# Start the stack
echo "🚀 Starting Mini Vault stack..."
./run.sh start

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 10

# Test Ollama
echo ""
check_service "http://localhost:11434/api/tags" "Ollama"
ollama_status=$?

# Test Mini Vault Server
echo ""
check_service "http://localhost:8000/status" "Mini Vault Server"
server_status=$?

# Test API with a simple request
if [ $server_status -eq 0 ]; then
    echo ""
    echo "🧪 Testing API endpoint..."
    
    # Test status endpoint
    status_response=$(curl -s http://localhost:8000/status)
    if echo "$status_response" | grep -q '"status":"running"'; then
        echo "✅ Status endpoint working correctly"
        api_status=0
    else
        echo "❌ Status endpoint not returning expected response"
        api_status=1
    fi
else
    api_status=1
fi

# Print final results
echo ""
echo "📊 Test Results:"
echo "================"

if [ $ollama_status -eq 0 ]; then
    echo "✅ Ollama: PASS"
else
    echo "❌ Ollama: FAIL"
fi

if [ $server_status -eq 0 ]; then
    echo "✅ Mini Vault Server: PASS"
else
    echo "❌ Mini Vault Server: FAIL"
fi

if [ $api_status -eq 0 ]; then
    echo "✅ API Endpoints: PASS"
else
    echo "❌ API Endpoints: FAIL"
fi

echo ""

# Overall result
if [ $ollama_status -eq 0 ] && [ $server_status -eq 0 ] && [ $api_status -eq 0 ]; then
    echo "🎉 All tests PASSED! Mini Vault is ready to use."
    echo ""
    echo "Next steps:"
    echo "  ./run.sh cli    # Start the interactive CLI"
    echo "  ./run.sh logs   # View service logs"
    echo "  ./run.sh status # Check service status"
    exit 0
else
    echo "💥 Some tests FAILED. Check the logs for details:"
    echo "  ./run.sh logs"
    exit 1
fi 
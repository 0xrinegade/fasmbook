#!/bin/bash

# Script to clean up any processes using the specified port
# Usage: ./cleanup-port.sh [port]

PORT=${1:-8081}

echo "Cleaning up processes on port $PORT..."

# Kill any processes using the port
if command -v fuser &> /dev/null; then
    fuser -k ${PORT}/tcp 2>/dev/null || true
elif command -v lsof &> /dev/null; then
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
else
    echo "Warning: Neither fuser nor lsof found. Cannot kill processes on port $PORT"
fi

# Wait a moment for processes to die
sleep 2

echo "Port $PORT cleanup complete"
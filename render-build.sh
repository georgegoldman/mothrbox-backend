#!/usr/bin/env bash
set -e

# Echo commands before execution
set -x

# Print current directory
echo "Current directory:"
pwd
ls -la

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Set NODE_OPTIONS to increase memory limit
export NODE_OPTIONS="--max-old-space-size=2048"

# Build the app
echo "Building application..."
pnpm run build

# Show build output
echo "Checking build output:"
ls -la
echo "Checking dist directory:"
ls -la dist || echo "dist directory not found!"

# Create a test file to check if dist is writable
echo "Creating test file in dist directory..."
mkdir -p dist
echo "console.log('Test file running successfully');" > dist/test.js

echo "Build completed!"
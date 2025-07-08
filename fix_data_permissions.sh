#!/bin/bash

# Fix permissions for the .data directory
echo "Fixing permissions for .data directory..."

# Create .data directory if it doesn't exist
mkdir -p .data
mkdir -p .data/music

# Ensure directory has correct permissions
chmod -R 775 .data

echo "Permissions fixed for .data directory"

# Check current metadata.json
if [ -f .data/music/metadata.json ]; then
  echo "Current metadata.json contents:"
  cat .data/music/metadata.json
  
  # Update paths in metadata
  node -r dotenv/config ./server/scripts/fix-music-paths.js
fi

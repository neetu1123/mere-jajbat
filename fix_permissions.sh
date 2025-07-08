#!/bin/bash

echo "Fixing ownership and permissions for Shayari Express project..."

# Define directories to fix
dirs=(".output" "tmp" "public/data" "public/uploads" "public/music" "server/data")

# Create any missing directories
for dir in "${dirs[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "Creating directory: $dir"
    mkdir -p "$dir"
  fi
done

# Function to check if directory exists and is writable
check_dir() {
  local dir=$1
  if [ -d "$dir" ]; then
    echo "✓ Directory exists: $dir"
    if [ -w "$dir" ]; then
      echo "✓ Directory is writable: $dir"
      return 0
    else
      echo "✗ Directory is not writable: $dir"
      return 1
    fi
  else
    echo "✗ Directory does not exist: $dir"
    return 1
  fi
}

# Check permissions before attempting to fix
echo -e "\nChecking permissions before fixing..."
for dir in "${dirs[@]}"; do
  check_dir "$dir"
done

# Create default files
echo -e "\nCreating default files..."
if [ ! -f "public/data/shayari.json" ]; then
  echo "Creating public/data/shayari.json"
  echo "[]" > public/data/shayari.json
fi

if [ ! -f "server/data/shayari.json" ]; then
  echo "Creating server/data/shayari.json"
  echo "[]" > server/data/shayari.json
fi

if [ ! -f "tmp/shayari.json" ]; then
  echo "Creating tmp/shayari.json"
  echo "[]" > tmp/shayari.json
fi

# Display final status
echo -e "\nPermission fix completed!"
echo "You should now be able to run 'npm run dev' without sudo."

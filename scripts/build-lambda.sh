#!/bin/bash

# Install dependencies in the main lambda directory
cd lambda && npm install

# Find all directories containing package.json in src/
find src -type f -name "package.json" -execdir sh -c 'echo "Installing dependencies in $(pwd)" && npm install' \;

cd ../..

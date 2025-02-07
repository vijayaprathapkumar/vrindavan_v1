#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Update the system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and Yarn (if not already installed)
echo "Installing Node.js and Yarn..."
if ! command -v node &> /dev/null
then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

if ! command -v yarn &> /dev/null
then
    npm install --global yarn
fi

# Navigate to the project directory
PROJECT_DIR=$(pwd)
echo "Navigating to project directory: $PROJECT_DIR"

# Install dependencies
echo "Installing dependencies..."
yarn install

# Build the Next.js application
echo "Building the Next.js application..."
yarn build

# Start the application in production mode using PM2
echo "Starting the application using PM2..."
if ! command -v pm2 &> /dev/null
then
    sudo npm install -g pm2
fi

# Ensure app uses port 4000
export PORT=4000
pm2 start yarn --name "vrindavan-dashboard" -- start
pm2 save
pm2 startup

echo "Application deployed and running on port 4000 successfully!"

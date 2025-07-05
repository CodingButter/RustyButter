#!/bin/bash

# RustyButter Setup Script
# This script helps set up the project for first-time users

echo "🎮 Welcome to RustyButter Setup!"
echo "================================"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d. -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check for pnpm or npm
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
    echo "✅ Using pnpm"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
    echo "✅ Using npm"
else
    echo "❌ No package manager found. Please install pnpm or npm."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and update:"
    echo "   - SERVER_IP (your Rust server IP)"
    echo "   - JWT_SECRET (generate a secure random string)"
    echo "   - Other settings as needed"
    echo ""
    read -p "Press Enter to continue after updating .env..."
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
$PKG_MANAGER install

# Database will be created automatically on first run
echo ""
echo "🗄️  Database will be created automatically on first run"

# Success message
echo ""
echo "✨ Setup complete!"
echo ""
echo "🚀 To start the development server, run:"
echo "   $PKG_MANAGER dev"
echo ""
echo "📖 Default admin credentials (first run only):"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3003"
echo "   Admin Dashboard: http://localhost:3000/admin"
echo ""
echo "Happy gaming! 🎮"
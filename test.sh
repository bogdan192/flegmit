#!/bin/bash

# Flegmit Test Script
# This script verifies that the complete CMS workflow functions correctly

echo "🧪 Testing Flegmit CMS and Build System..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Test database initialization
echo "🗄️  Testing database setup..."
npm run setup

# Test static build
echo "🏗️  Testing static site build..."
npm run build

# Verify build output
if [ ! -f "build/index.html" ]; then
    echo "❌ Build failed - index.html not found"
    exit 1
fi

if [ ! -f "build/styles.css" ]; then
    echo "❌ Build failed - styles.css not found"
    exit 1
fi

echo "✅ Static site build successful!"

# Count generated files
file_count=$(ls -1 build/ | wc -l)
echo "📁 Generated $file_count files in build directory"

# Test server startup (quick test)
echo "🚀 Testing server startup..."
timeout 5s npm start > /dev/null 2>&1 &
server_pid=$!

# Wait a moment for server to start
sleep 2

# Check if server is running
if kill -0 $server_pid 2>/dev/null; then
    echo "✅ Server started successfully!"
    kill $server_pid
else
    echo "❌ Server failed to start"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Flegmit is ready for deployment."
echo ""
echo "📖 Next steps:"
echo "   1. Deploy to Render using the build/ directory"
echo "   2. Access admin panel at /admin with credentials: bogdan/bogdan"
echo "   3. Create and publish your content"
echo "   4. Run 'npm run build' to regenerate static files"
echo ""
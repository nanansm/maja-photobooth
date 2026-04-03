#!/bin/bash

# Demo Mode Launch Script
# Sets up demo configuration and starts the app

set -e

echo "🖼️  Starting Maja Photobooth in DEMO MODE"
echo "=========================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies not found. Running install..."
    npm install
fi

# Create demo config if not exists
if [ ! -f "config/payment.json" ]; then
    echo "⚙️  Creating demo payment config..."
    mkdir -p config
    echo '{
  "secretKey": "demo_xendit_key",
  "callbackToken": "demo_callback_token",
  "webhookPort": 3847
}' > config/payment.json
fi

# Set demo env
export DEMO_MODE=true

# Create demo frames directory
mkdir -p assets/frames

# Create a simple demo frame if none exists
if [ -z "$(ls -A assets/frames 2>/dev/null)" ]; then
    echo "🖼️  Creating demo frame template..."
    echo '{
  "id": "demo-frame",
  "name": "Demo Frame",
  "previewImage": "",
  "overlayImage": "",
  "photoSlots": [
    { "x": 50, "y": 50, "width": 300, "height": 200 }
  ],
  "canvasWidth": 400,
  "canvasHeight": 300,
  "isActive": true
}' > assets/frames/demo-frame.json
fi

echo "✅ Demo setup complete!"
echo ""
echo "🚀 Starting development server..."
echo "   - App will open in new window"
echo "   - Default admin password: changeme123"
echo "   - Click ⚙️ to access admin panel"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev

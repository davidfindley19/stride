#!/bin/bash
set -e

# Load .env if present
if [ -f "$(dirname "$0")/.env" ]; then
  export $(grep -v '^#' "$(dirname "$0")/.env" | xargs)
fi

# Check credentials
if [ -z "$STRAVA_CLIENT_ID" ] || [ -z "$STRAVA_CLIENT_SECRET" ]; then
  echo ""
  echo "❌  Strava credentials not found."
  echo ""
  echo "   Please edit the .env file in this folder and add:"
  echo "   STRAVA_CLIENT_ID=your_id_here"
  echo "   STRAVA_CLIENT_SECRET=your_secret_here"
  echo ""
  echo "   See README.md for full setup instructions."
  echo ""
  exit 1
fi

# Install deps if needed
if ! python3 -c "import flask, requests" 2>/dev/null; then
  echo "📦 Installing required packages..."
  pip3 install flask requests --quiet
fi

echo ""
echo "🏃 Starting Stride — Strava Dashboard"
echo "   Open http://localhost:5000 in your browser"
echo "   Press Ctrl+C to stop"
echo ""

# Open browser after a short delay
(sleep 1.5 && open http://localhost:5000) &

cd "$(dirname "$0")"
python3 app.py

#!/bin/bash

# Maja Photobooth Dependency Installation Script
# This script installs system dependencies required for the application

set -e

echo "🔧 Installing Maja Photobooth dependencies..."

# Detect OS
OS="$(uname)"
case "${OS}" in
  Linux*)     MACHINE=Linux;;
  Darwin*)    MACHINE=Mac;;
  *)          MACHINE="UNKNOWN:${OS}"
esac

echo "Detected OS: ${MACHINE}"

if [ "${MACHINE}" = "Mac" ]; then
  echo "🍺 Installing via Homebrew..."

  # Check if Homebrew is installed
  if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi

  # Install dependencies
  brew install gphoto2 libgphoto2 cairo pango libpng jpeg giflib librsvg

  echo "✅ macOS dependencies installed"

elif [ "${MACHINE}" = "Linux" ]; then
  echo "🐧 Installing via apt/yum..."

  # Detect Linux distribution
  if [ -f /etc/debian_version ]; then
    # Debian/Ubuntu
    sudo apt-get update
    sudo apt-get install -y \
      gphoto2 \
      libgphoto2-dev \
      libjpeg-dev \
      libpng-dev \
      libv4l-dev \
      pkg-config \
      build-essential \
      python3 \
      libpthread-stubs0-dev \
      libcairo2-dev \
      libpango1.0-dev \
      libgif-dev \
      librsvg2-dev
  elif [ -f /etc/fedora-release ]; then
    # Fedora
    sudo dnf install -y \
      gphoto2 \
      gphoto2-devel \
      libjpeg-turbo-devel \
      libpng-devel \
      libv4l-devel \
      pkg-config \
      gcc-c++ \
      make \
      python3
  elif [ -f /etc/arch-release ]; then
    # Arch
    sudo pacman -S --needed gphoto2 libgphoto2 libjpeg-turbo libpng
  else
    echo "Unsupported Linux distribution. Please install gphoto2 and development libraries manually."
    exit 1
  fi

  echo "✅ Linux dependencies installed"

else
  echo "❌ Unsupported operating system: ${OS}"
  exit 1
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Configure payment in config/payment.json (if using Xendit)"
echo "  2. Run 'npm run dev' to start development"
echo "  3. Or 'npm run build' to build the application"
echo ""
echo "📖 See README.md for full documentation"

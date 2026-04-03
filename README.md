# Maja Photobooth - Complete Installation & Setup Guide

**Cross-platform photobooth application with payment integration, DSLR camera support, and professional printing**

![MIT License](https://img.shields.io/badge/license-MIT-green.svg)
![Electron](https://img.shields.io/badge/Electron-29+-purple.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)

---

## 📸 Features Overview

- ✅ **Full Kiosk Mode** - Touch-friendly, fullscreen customer interface
- ✅ **Payment Integration** - QRIS & Virtual Account via Xendit
- ✅ **DSLR Camera Support** - Canon EOS series via gphoto2
- ✅ **Webcam Fallback** - Works with any USB webcam
- ✅ **Photo Processing** - Strips, collages, frames, filters
- ✅ **Direct Printing** - Cross-platform printer support (CUPS/Win32)
- ✅ **Digital Share** - QR code download links + Email
- ✅ **Admin Panel** - Complete management dashboard
- ✅ **Configurable Packages** - Define your own pricing
- ✅ **Frame System** - Custom overlay templates (PNG + JSON)
- ✅ **Demo Mode** - Test entire flow without hardware

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Installation](#quick-installation)
3. [Detailed Setup by OS](#detailed-setup-by-os)
   - [macOS](#macOS)
   - [Ubuntu/Debian Linux](#ubuntudebian-linux)
   - [Windows](#windows)
4. [Core Configuration](#core-configuration)
   - [Payment Setup (Xendit)](#payment-setup-xendit)
   - [Email Configuration (Gmail)](#email-configuration-gmail)
   - [Demo Mode](#demo-mode)
5. [Hardware Setup](#hardware-setup)
   - [DSLR Camera (gphoto2)](#dslr-camera-gphoto2)
   - [Printer Configuration](#printer-configuration)
6. [Running the Application](#running-the-application)
7. [Testing & Troubleshooting](#testing--troubleshooting)
8. [Advanced Configuration](#advanced-configuration)
9. [Building for Production](#building-for-production)
10. [Support & Resources](#support--resources)

---

## System Requirements

### Minimum Requirements
- **OS**: macOS 10.15+, Ubuntu 20.04+, Windows 10+
- **RAM**: 4 GB (8 GB recommended)
- **Storage**: 2 GB free space (+ space for photos)
- **Display**: 1280x800 minimum (1920x1080 recommended)

### Software Dependencies
- **Node.js**: 20.x LTS or higher
  - Download: https://nodejs.org/
  - Verify: `node --version`
- **npm**: 9.x or higher (comes with Node.js)
  - Verify: `npm --version`

### Optional Hardware
- **DSLR Camera**: Canon EOS series (R100, R50, R5, R6, 1300D, 600D, 700D, 800D, etc.)
  - Full list: See [Supported Cameras](#supported-cameras)
- **Photobooth Printer**: DNP DS-RX1HS, Epson SureLab, Citizen CX-02, or any CUPS/Win32 printer
  - Full list: See [Supported Printers](#supported-printers)

---

## Quick Installation

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd maja-photobooth

# Install npm dependencies
npm install

# Rebuild native modules for Electron (IMPORTANT!)
npx electron-rebuild
```

### 2. Build Application

```bash
# Build both main and renderer
npm run build

# Or run in development mode
npm run dev
```

### 3. Access Application

- **Development Mode**: Opens Electron window automatically
- **Dev Server Only**: `http://localhost:5173` (for web testing)
- **Production Build**: `npm run build:all` creates installers

---

## Detailed Setup by Operating System

### macOS

#### Step 1: Install Homebrew (if not installed)

```bash
# Check if Homebrew exists
which brew

# If not installed, install it:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Step 2: Install System Dependencies

```bash
# Install all required dependencies
brew install pkg-config pixman cairo libpng jpeg giflib webp pango fontconfig

# Optional: Install gphoto2 for DSLR camera support
brew install gphoto2 libgphoto2
```

#### Step 3: Install Node.js

```bash
# Option A: Using Homebrew (recommended)
brew install node@20

# Option B: Download from nodejs.org
# https://nodejs.org/en/download/
```

#### Step 4: Install Xcode Command Line Tools

```bash
xcode-select --install
```

#### Step 5: Verify Installation

```bash
node --version  # Should show v20.x or higher
npm --version   # Should show 9.x or higher
brew --version  # Should show Homebrew version
```

#### Step 6: Install App Dependencies

```bash
cd /path/to/maja-photobooth
npm install --ignore-scripts
npm install canvas@^2.11.2 --build-from-source
npx electron-rebuild
npm run build
```

#### Step 7: Run Application

```bash
npm run dev
# or for production build
npm run build:all
```

---

### Ubuntu/Debian Linux

#### Step 1: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

#### Step 2: Install Build Tools

```bash
sudo apt install -y build-essential libssl-dev
```

#### Step 3: Install System Dependencies

```bash
# Core dependencies for canvas and image processing
sudo apt install -y \
  pkg-config \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libpng-dev \
  libgif-dev \
  librsvg2-dev \
  libwebp-dev \
  libpixman-1-dev \
  fontconfig
```

#### Step 4: Install Node.js 20 (LTS)

```bash
# Using NodeSource (recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # v20.x
npm --version
```

#### Step 5: Install gphoto2 (for DSLR cameras)

```bash
sudo apt install -y gphoto2 libgphoto2-dev libgphoto2-port12

# Add user to plugdev group (required for camera access)
sudo usermod -a -G plugdev $USER
# Log out and log back in for group changes to take effect
```

#### Step 6: Install Printer Dependencies (CUPS)

```bash
sudo apt install -y \
  cups \
  printer-driver-all \
  libcups2-dev
```

#### Step 7: Install App Dependencies

```bash
cd /path/to/maja-photobooth
npm install --ignore-scripts
npm install canvas@^2.11.2 --build-from-source
npx electron-rebuild
npm run build
```

#### Step 8: Run Application

```bash
npm run dev
```

---

### Windows 10/11

#### Step 1: Install Node.js

1. Download **Node.js 20.x LTS** (Windows Installer) from:  
   https://nodejs.org/en/download/

2. Run the installer:
   - Check "Add to PATH"
   - Use default settings

3. Verify installation:

```cmd
node --version
npm --version
```

#### Step 2: Install Visual Studio Build Tools

You need Visual Studio Build Tools 2022 for native modules:

**Option A: Using npm (Recommended)**

```cmd
npm install --global windows-build-tools
```

**Option B: Manual Installation**

1. Download **Visual Studio Build Tools** from:  
   https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

2. Install these components:
   - **Desktop development with C++**
   - Windows 10/11 SDK
   - MSVC v143 - VS 2022 C++ x64/x86 build tools

#### Step 3: Install System Dependencies via Chocolatey (Optional)

If you have Chocolatey package manager:

```cmd
choco install -y pkg-configlite cairo pango libpng jpeg giflib webp
```

Or manual setup:
- Most dependencies are bundled with the installer
- If `canvas` fails, you may need GTK+ runtime:  
  https://www.gtk.org/docs/installations/windows/

#### Step 4: Install App Dependencies

```cmd
cd C:\path\to\maja-photobooth
npm install --ignore-scripts
npm install canvas@^2.11.2 --build-from-source
npx electron-rebuild
npm run build
```

#### Step 5: Run Application

```cmd
npm run dev
```

#### Alternative: Use Windows Subsystem for Linux (WSL)

For easier setup, consider using **WSL2**:

```bash
# In WSL2 terminal (Ubuntu)
sudo apt update
sudo apt install -y build-essential libssl-dev pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev libpng-dev libgif-dev
npm install
npx electron-rebuild
npm run dev
```

---

## Core Configuration

### Payment Setup (Xendit)

Xendit is the payment gateway supporting QRIS (Indonesian QR code) and Virtual Account.

#### Step 1: Create Xendit Account

1. Go to **[Xendit Dashboard](https://dashboard.xendit.co)**
2. Sign up (business account recommended)
3. Verify your account (KYC may be required)

#### Step 2: Get API Credentials

1. In Xendit Dashboard, go to **Settings** → **API Keys**
2. Copy **Secret API Key** (looks like: `xnd_development_...`)
3. Also copy **Callback Token** (for webhook verification)

#### Step 3: Configure in Photobooth

1. Start the application: `npm run dev`
2. Click **⚙️ (Settings)** in top-right corner → **Payment** tab
3. Fill in:
   - **Xendit Secret API Key**: `xnd_development_...` or `xnd_production_...`
   - **Xendit Callback Token**: Your callback token from Xendit
   - **Webhook Port**: `3847` (default, must be open in firewall)
4. Click **Save Configuration**

#### Step 4: Configure Webhook in Xendit

1. In Xendit Dashboard, go to **Developers** → **Webhooks**
2. Click **Add Webhook URL**
3. Enter URL (replace `YOUR-IP` with your server's public IP):
   ```
   http://YOUR-IP:3847/webhook/xendit
   ```
4. Select events:
   - ✅ `invoice.paid`
   - ✅ `invoice.expired`
   - ✅ `invoice.failed`
5. Copy **Webhook Token** (this is different from API token)
6. Paste into Photobooth Settings → **Webhook Token**
7. Save

#### Step 5: Test Payment Webhook

**Local Testing with ngrok** (for development):

```bash
# Install ngrok (https://ngrok.com/)
# Create account and get auth token

ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN

# Expose port 3847
ngrok http 3847

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Use it in Xendit webhook:
# https://abc123.ngrok.io/webhook/xendit
```

**Test Payment Flow:**
1. In Photobooth Admin → Dashboard, click **Test Payment**
2. Scan QR code with your phone
3. Complete payment in Xendit app
4. Wait ~3-5 seconds for webhook
5. Status should change to "PAID"

---

### Email Configuration (Gmail)

Send photo downloads via email with beautiful HTML templates.

#### Step 1: Enable Gmail App Password

If using Gmail, **DO NOT** use your regular password. Use App Password:

1. Go to **[Google Account Security](https://myaccount.google.com/security)**
2. Enable **2-Step Verification** (if not already)
3. Under "Signing in to Google", click **App passwords**
4. Select **Mail** → **Other (Custom name)** → "Photobooth"
5. Click **Generate**
6. Copy the 16-character password (no spaces)

#### Alternative: Use Google Workspace with OAuth2

For production with custom domain:
- Set up OAuth2 credentials in Google Cloud Console
- See: https://developers.google.com/gmail/api/auth/web-server

#### Step 2: Configure Email in Photobooth

1. In Admin → Settings → **Email** tab
2. Fill in:

| Field | Value |
|-------|-------|
| SMTP Provider | `gmail` |
| SMTP Host | `smtp.gmail.com` |
| SMTP Port | `587` |
| Use TLS/STARTTLS | ✅ Enabled |
| SMTP Username | your-email@gmail.com |
| SMTP Password | **16-char app password** |
| From Name | Your Booth Name |
| From Email | your-email@gmail.com |

3. Click **Test Connection** (should return "✅ Success")
4. Click **Save Configuration**

#### Step 3: Customize Email Template (Optional)

1. In Admin → Settings → **Email** tab
2. Edit the HTML template with your branding
3. Variables you can use:
   - `{customerName}` - Customer's name
   - `{eventName}` - Event/booth name
   - `{sessionId}` - Unique session ID
   - `{downloadUrl}` - QR code download link
   - `{boothName}` - Your booth name
4. Click **Save Template**

**Template preview will appear in real-time below.**

---

### Demo Mode

Perfect for testing UI without hardware or real payments.

#### Enable Demo Mode:

1. Go to **Admin** → **Settings** → **General** tab
2. Toggle **Demo Mode** to ON
3. Save configuration

#### Demo Mode Features:

| Feature | Demo Behavior |
|---------|---------------|
| Camera | Uses placeholder image instead of real camera |
| Payment | Auto-confirms after 5 seconds (no QR scan needed) |
| Printer | Skips actual printing, shows "success" message |
| Webhook | Not required (payment auto-confirms) |
| Storage | Uses local temp folder |

#### Testing Complete Customer Journey:

1. Start app (make sure Demo Mode is ON)
2. Touch screen to start
3. Select any package
4. Payment screen - wait 5s (auto-confirm)
5. Capture screen - press spacebar or click to take photos
6. Frame select - choose any frame
7. Processing - automatic
8. Print/Share screen - can test both options
9. Back to idle

---

## Hardware Setup

### DSLR Camera (gphoto2)

Supported cameras: Canon EOS R100, R50, R5, R6, R7, 1300D, 600D, 700D, 800D, 250D, 2000D, 4000D, Nikon D3500, D5600, Sony A6000 series, and many more.

#### macOS Setup:

```bash
# Install gphoto2
brew install gphoto2 libgphoto2

# Verify installation
gphoto2 --version

# Detect camera (connect via USB)
gphoto2 --auto-detect

# Expected output:
# Model                          Port
# Canon EOS R50                  usb:001,012
```

#### Linux Setup:

```bash
# Install gphoto2
sudo apt install gphoto2 libgphoto2-dev

# Add user to plugdev group (required)
sudo usermod -a -G plugdev $USER
# Log out and log back in

# Detect camera
gphoto2 --auto-detect
```

#### Windows Setup:

```cmd
# Download gphoto2 for Windows:
# https://github.com/gphoto/gphoto2/releases

# Extract and add to PATH
# Or install via Chocolatey:
choco install gphoto2

# Test detection (camera must be in PTP mode)
gphoto2 --auto-detect
```

#### Test Camera Capture:

```bash
# Take a test photo and download
gphoto2 --capture-image-and-download --filename test.jpg

# Check if file exists
ls -la test.jpg
```

#### Configure Camera in Photobooth:

1. Start Photobooth
2. Go to Admin → Settings → **Camera** tab
3. Camera should auto-detect
4. Select your camera from dropdown
5. Click **Save**

---

### Printer Configuration

Supported printers: Epson SureLab D530/D570/D700/D800, DNP DS-RX1HS, DS620A, HiTi P520L/P525L, Citizen CX-02/CX-02W, and any CUPS/Windows printer.

#### macOS Printer Setup:

1. Open **System Settings** → **Printers & Scanners**
2. Click **+** to add printer
3. Select your printer (must be network/USB)
4. Install driver if prompted
5. Note printer name exactly

#### Linux (CUPS) Printer Setup:

```bash
# Check if CUPS is running
sudo systemctl status cups

# Start if not running
sudo systemctl start cups
sudo systemctl enable cups

# Add printer via browser:
# Open http://localhost:631
# Follow "Administration" → "Add Printer"

# Or command line:
lpadmin -p "YourPrinterName" -E -v usb://... -m everywhere

# List printers
lpstat -p -d
```

#### Windows Printer Setup:

1. Open **Settings** → **Bluetooth & devices** → **Printers & scanners**
2. Click **Add device**
3. Select your printer
4. Install manufacturer driver
5. Note printer name

#### Configure Printer in Photobooth:

1. Go to Admin → Settings → **Printer** tab
2. Printer should auto-detect
3. Select your printer from dropdown
4. Set default paper size:
   - **4x6** (10x15 cm) - most photobooth printers
   - **2x6** (5x15 cm) - strip format
   - **5x7** (13x18 cm) - larger format
   - **A4** - standard paper
5. Quality: **Normal** (recommended), **High** (slower), **Draft** (fastest)
6. Click **Test Print** (prints test page)
7. Save configuration

---

## Running the Application

### Development Mode (with hot reload)

```bash
# Start both Vite dev server + Electron
npm run dev

# Or separately:
npm run dev:renderer  # Vite dev server only
npm run dev:main      # Electron only (after building)
```

**Access points:**
- Electron window opens automatically
- Dev server: `http://localhost:5173` (React DevTools enabled)
- Webpack HMR enabled for instant updates

### Production Build

```bash
# Build TypeScript + Vite
npm run build

# Or full build for distribution
npm run build:all
```

**Outputs:**
- `dist/main/` - Main process (Electron)
- `dist/renderer/` - Renderer (React app)
- `dist/` (with electron-builder) - Platform-specific installers

### Testing in Browser Only (without Electron)

```bash
npm run dev:renderer
# Open http://localhost:5173 in browser
```

**Note:** Some features won't work without Electron:
- Camera access (requires Electron permissions)
- File system operations
- Native printer
- System notifications

---

## Testing & Troubleshooting

### Common Issues & Solutions

#### 1. Native Module Compilation Errors

**Error:** `canvas.node` compiled against different Node.js version

```bash
# Solution: Rebuild for Electron
npx electron-rebuild

# If fails, clear and reinstall
rm -rf node_modules package-lock.json
npm install --ignore-scripts
npm install canvas@^2.11.2 --build-from-source
npx electron-rebuild
```

#### 2. Camera Not Detected

```bash
# Check gphoto2 installation
gphoto2 --version

# Detect cameras
gphoto2 --auto-detect

# If no cameras found:
# - Check USB connection (try different port/cable)
# - Ensure camera is in PTP/MTP mode (not mass storage)
# - On Linux: sudo usermod -a -G plugdev $USER (then logout/login)
# - On macOS: may need to allow camera access in System Preferences
```

#### 3. Printer Not Found

```bash
# Linux/macOS: Check CUPS
lpstat -p

# macOS: System Preferences → Printers & Scanners
# Windows: Settings → Printers & scanners

# In app: Admin → Settings → Printer
# Click "Refresh" button
```

#### 4. Electron Won't Start

```bash
# Clear Electron cache
rm -rf node_modules/electron

# Reinstall Electron
npm install electron --save-dev

# Check Electron binary exists
ls node_modules/electron/dist/Electron.app/Contents/MacOS/Electron
```

#### 5. Port Already in Use

```bash
# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or change Vite port in package.json:
# dev:renderer: "vite --port 3000"
```

#### 6. Permission Denied Errors (macOS/Linux)

```bash
# Give execute permissions to scripts
chmod +x scripts/install-deps.sh

# Fix npm cache permissions
sudo chown -R $(whoami) ~/.npm
```

#### 7. Payment Webhook Not Receiving

```bash
# Check if port 3847 is open
netstat -an | grep 3847

# Test webhook endpoint
curl http://localhost:3847/health

# If using ngrok, ensure it's running:
ngrok http 3847
# Use ngrok URL in Xendit dashboard

# Check logs in app: Admin → History → Webhook events
```

#### 8. Email Sending Fails

- Verify app password (not regular Gmail password)
- Check "Less secure app access" is OFF (use App Password instead)
- For Gmail: may need to unlock Captcha:  
  https://accounts.google.com/DisplayUnlockCaptcha
- Test SMTP manually:

```bash
# Using telnet
telnet smtp.gmail.com 587
# EHLO test
# AUTH LOGIN
# Base64 encode your email: echo -n "your-email@gmail.com" | base64
# Base64 encode your app password: echo -n "your-app-password" | base64
```

### Viewing Application Logs

```bash
# Main app logs (stored in userData folder)
# macOS: ~/Library/Application Support/maja-photobooth/logs/
# Linux: ~/.config/maja-photobooth/logs/
# Windows: %APPDATA%/maja-photobooth/logs/

tail -f ~/Library/Application\ Support/maja-photobooth/logs/app.log
```

---

## Advanced Configuration

### Custom Frame Templates

Create custom overlay frames (PNG with transparency):

#### Structure:

```
assets/frames/
├── wedding-gold/
│   ├── preview.jpg        (thumbnail for UI)
│   ├── overlay.png        (transparent PNG overlay)
│   └── template.json      (layout config)
```

#### template.json example:

```json
{
  "id": "wedding-gold",
  "name": "Wedding Gold",
  "previewImage": "wedding-gold-preview.jpg",
  "overlayImage": "wedding-gold-overlay.png",
  "photoSlots": [
    { "x": 40, "y": 80, "width": 420, "height": 280 },
    { "x": 40, "y": 380, "width": 420, "height": 280 }
  ],
  "canvasWidth": 500,
  "canvasHeight": 750,
  "isActive": true
}
```

**PhotoSlots explanation:**
- `x, y`: Top-left corner position
- `width, height`: Size each photo will be resized to
- Order in array = position in strip (top to bottom)

#### Upload via Admin Panel:

1. Admin → **Frames** tab
2. Click **Upload New**
3. Select preview image (jpg/png)
4. Upload overlay PNG
5. Upload JSON template
6. Set sort order
7. Click **Save**

---

### Database Structure

The app uses SQLite (better-sqlite3) for data persistence.

**Database location:**
- macOS: `~/Library/Application Support/maja-photobooth/data.db`
- Linux: `~/.config/maja-photobooth/data.db`
- Windows: `%APPDATA%\maja-photobooth\data.db`

**Tables:**
- `packages` - Photo packages configuration
- `frames` - Frame templates
- `sessions` - Customer sessions
- `photos` - Individual photos
- `print_jobs` - Print queue
- `payment_transactions` - Payment history
- `settings` - App configuration (JSON)

---

### Environment Variables

Create `.env` file in project root:

```bash
# Payment
XENDIT_SECRET_KEY=xnd_development_...
XENDIT_CALLBACK_TOKEN=your_callback_token
WEBHOOK_PORT=3847

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App
NODE_ENV=development
LOG_LEVEL=info
```

---

### Adding New Filter Effects

Edit `src/main/photo/PhotoProcessor.ts`:

```typescript
async applyFilter(photoPath: string, filter: string): Promise<string> {
  let img = sharp(photoPath);

  switch (filter) {
    case 'vintage':
      img = img.modulate({ saturation: 0.7, brightness: 1.1 });
      break;
    case 'dramatic':
      img = img.linear(-1, 255);  // Invert + adjust
      break;
    case 'warm-vibrant':
      img = img.modulate({ saturation: 1.3, temperature: 6500 });
      break;
    // Add more...
  }

  // Apply and save
}
```

---

## Building for Production

### All Platforms

```bash
# Clean previous builds
rm -rf dist

# Build main + renderer
npm run build

# Create platform-specific installer
npm run build:all
```

**Outputs:**
- **macOS**: `.dmg` and `.zip` in `dist/`
- **Linux**: `.AppImage`, `.deb`, `.rpm` in `dist/`
- **Windows**: `.exe` installer and `.portable` in `dist/`

### Signing & Notarization (macOS)

For distribution outside development:

```bash
# 1. Install Electron Builder
npm install --save-dev electron-builder

# 2. Configure electron-builder.yml
# Add your Apple Developer ID:
# mac:
#   identity: "Developer ID Application: Your Name (TEAMID)"

# 3. Build with signing
npm run dist

# 4. Notarize (requires Apple Developer account)
# electron-builder handles this automatically if configured
```

### Windows Code Signing

```yaml
# electron-builder.yml
win:
  sign: certificateFile: "cert.p12"  # PFX certificate
  signDigestAlgorithm: "sha256"
```

---

## Support, Documentation & Useful Links

### Official Documentation

| Resource | Link |
|----------|------|
| 📖 Electron Docs | https://www.electronjs.org/docs |
| 🔥 React Docs | https://react.dev/ |
| 🛠️ Vite Guide | https://vitejs.dev/guide/ |
| 📦 Xendit API | https://docs.xendit.co/ |
| 📷 gphoto2 Docs | http://www.gphoto.org/doc/ |
| 🖨️ CUPS Printing | https://www.cups.org/doc/ |

### Hardware Compatibility

#### Supported Cameras (tested)

**Canon EOS Series:**
- R100, R50, R10, R5, R6, R7
- 1300D, 600D, 700D, 800D, 250D, 2000D, 4000D
- Kiss series (Japan)

**Nikon:**
- D3500, D5600, D5000, D3000 series

**Sony:**
- A6000, A6100, A6400, A6600, A7 series

**Others:**  
Any UVC-compatible USB webcam works as fallback.

Full list: https://www.gphoto.org/doc/remote-cameras-list

#### Supported Printers

**Dye-Sublimation (recommended for photobooth):**
- DNP DS-RX1HS (10x15 cm, 8s/print)
- DNP DS620A (10x15 cm, 7s/print)
- Mitsubishi CP-D80DW
- Citizen CX-02 / CX-02W
- HiTi P520L / P525L

**Inkjet:**
- Epson SureLab D530, D570, D700, D800
- Canon SELPHY CP1300

**Any CUPS/Windows printer** works (but dye-sublimation recommended for durability).

---

## Frequently Asked Questions (FAQ)

### Q: Can I use this without payment integration?

**A:** Yes! Enable **Demo Mode** in Settings, or leave Xendit fields empty. Payment screens will be skipped.

### Q: How many photos per session?

**A:** Configurable per package. Typical: 2-4 photos per strip. Max limited by memory and camera buffer.

### Q: Can I run on tablet/Android?

**A:** No, this is Electron desktop app only. For mobile, consider Progressive Web App (PWA) alternatives.

### Q: Storage space per session?

**A:** Approximately:
- Raw photos: 5-8 MB × number of photos
- Processed strip: 2-4 MB (JPEG)
- With 4 photos: ~25-35 MB per session

### Q: Can I use multiple cameras?

**A:** Currently single camera. Multiple cameras require hardware switcher or custom modification.

### Q: How to backup data?

**A:**
1. Copy SQLite database: `data.db`
2. Copy `config/` folder (payment.json, email.json)
3. Copy `assets/frames/` folder
4. Copy `assets/sounds/` if customized

### Q: Can I customize the UI?

**A:** Yes! Edit files in `src/renderer/routes/Kiosk/` and `src/renderer/routes/Admin/`. Styles in `src/renderer/index.css` and Tailwind classes.

### Q: Does it support offline mode?

**A:** Yes, except for payment (requires internet) and email sending (requires SMTP). All other features work offline.

### Q: How to add new language?

**A:** Edit `src/renderer/i18n/` or use i18next library. Currently Indonesian only.

### Q: Can I integrate with cloud storage (Google Drive, S3)?

**A:** Planned feature. Currently local storage only. Can be extended in `src/main/storage/CloudStorage.ts`.

---

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting PRs.

### Development Workflow

```bash
git clone <repository>
cd maja-photobooth
npm install
npx electron-rebuild
npm run dev
```

Make changes → Test in dev mode → Submit PR.

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

- **Issues**: https://github.com/your-username/maja-photobooth/issues
- **Discussions**: https://github.com/your-username/maja-photobooth/discussions
- **Email**: support@openphotobooth.dev (example)
- **Documentation**: https://docs.openphotobooth.dev

---

## Acknowledgments

Built with:
- [Electron](https://www.electronjs.org/) - Desktop app framework
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Sharp](https://sharp.pixelplumbing.com/) - Image processing
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - Database
- [Xendit](https://xendit.co/) - Payment gateway
- [gphoto2](http://www.gphoto.org/) - DSLR control
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Zod](https://zod.dev/) - Validation

Special thanks to the photobooth community and all contributors!

---

**Made with ❤️ for photobooth enthusiasts**

Last updated: April 2026

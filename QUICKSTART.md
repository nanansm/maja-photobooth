# Quick Start Guide - Maja Photobooth

## Prerequisites

- **Node.js 20+** - https://nodejs.org
- **Git** - for cloning

## Installation Steps

### 1. Terminal - Navigate to project
```bash
cd /Users/nanansomanan/Documents/GitHub/maja-photobooth
```

### 2. Clean up any previous failed installs
```bash
rm -rf node_modules package-lock.json
```

### 3. Fix npm permissions (if you see EACCES errors)
```bash
# If you own the cache:
sudo chown -R $(whoami) ~/.npm

# Or if no sudo, use:
npm config set cache ~/.npm-cache --global
```

### 4. Install dependencies
```bash
npm install --legacy-peer-deps
```

This will install all packages including native modules (sharp, canvas, etc.)

**Note for macOS:** You may need Xcode Command Line Tools:
```bash
xcode-select --install
```

**Note for Linux:** Install build dependencies:
```bash
# Ubuntu/Debian
sudo apt-get install -y build-essential python3 libcairo2-dev libpango1.0-dev libjpeg-dev libpng-dev libgif-dev librsvg2-dev
```

### 5. Start Development Server
```bash
npm run dev
```

This will:
- Build TypeScript for main process
- Start Vite dev server for renderer
- Launch Electron window

### 6. Access the App

**Kiosk Mode:**
- App opens in fullscreen automatically
- Touch/click anywhere to start

**Admin Panel:**
- Click the gear icon (⚙️) in top-right corner
- Default password: `changeme123`
- Full admin dashboard with settings

---

## Demo Mode (No Hardware Required)

1. Click ⚙️ → Enter admin password
2. Go to **Settings** tab
3. Scroll to **Admin** section
4. Enable **"Demo Mode"**
5. Save Settings

Now you can test:
- Payment auto-confirms in 5 seconds
- Camera uses placeholder (no DSLR needed)
- Printing is skipped
- Email sends with local file URLs

---

## Full Hardware Setup

### Camera (Canon EOS)
1. Connect camera via USB
2. Set camera to "Mass Storage" mode
3. Test detection:
```bash
gphoto2 --auto-detect
```

If you see your camera, it's ready.

### Printer
1. Install printer driver
2. Test printing a test page from OS
3. In Admin → Settings → Printer, select your printer
4. Use "Test Print" button

### Email (Gmail)
1. Enable 2-Factor Authentication on your Gmail
2. Generate App Password (16 digits)
3. In Admin → Settings → Email:
   - Provider: Gmail
   - Host: smtp.gmail.com
   - Port: 587
   - Username: your-email@gmail.com
   - Password: [app password]
   - From Name/Email: customize
4. Click "Test Connection"

### Payment (Xendit)
1. Register at https://xendit.co
2. Get Secret API Key from Dashboard
3. Create callback token (random string)
4. In Admin → Settings → Payment:
   - Enter Secret Key
   - Enter Callback Token
   - Set Webhook Port (default 3847)
5. Set webhook in Xendit Dashboard to: `http://YOUR_IP:3847/webhook/xendit`
6. Click "Test Connection"

---

## Troubleshooting

### "Cannot find module 'better-sqlite3'"
Native module build failed. Install build tools:
- macOS: `xcode-select --install`
- Linux: `sudo apt-get install build-essential`

Then: `npm rebuild better-sqlite3`

### "gphoto2 not found"
Install gphoto2:
- macOS: `brew install gphoto2`
- Linux: `sudo apt-get install gphoto2`

### "Canvas native module not found"
You need Cairo/Pango:
- macOS: `brew install cairo pango libpng jpeg giflib librsvg`
- Linux: `sudo apt-get install libcairo2-dev libpango1.0-dev libjpeg-dev libpng-dev libgif-dev librsvg2-dev`

Then: `npm rebuild node-canvas`

### Port 3847 already in use
Change webhook port in Admin → Settings → Payment, or stop the other process:
```bash
lsof -ti:3847 | xargs kill -9
```

### Electron window won't start
Check logs: Look for errors in terminal. Common issues:
- Node.js version too old (need 20+)
- Missing build tools

---

## Project Structure Quick Tour

```
maja-photobooth/
├── src/
│   ├── main/           # Electron backend
│   │   ├── camera/     # DSLR control via gphoto2
│   │   ├── payment/    # Xendit integration
│   │   ├── photo/      # Image processing (Sharp)
│   │   ├── printer/    # Print service
│   │   ├── email/      # SMTP email service
│   │   ├── notification/ # Desktop & Telegram alerts
│   │   ├── storage/    # Cloud upload (optional)
│   │   └── handlers.ts # All IPC routes
│   │
│   ├── renderer/       # React frontend
│   │   ├── routes/
│   │   │   ├── Kiosk/    # Customer UI (11 screens)
│   │   │   └── Admin/    # Management UI (6 tabs)
│   │   └── store/        # Zustand state
│   │
│   └── shared/         # TypeScript types
│
├── assets/             # Images, frames, icons
├── config/             # Configuration files
├── scripts/            # install-deps.sh, demo.sh
├── tests/              # Unit tests
├── .github/workflows/  # CI/CD builds
├── package.json
├── electron-builder.yml
└── README.md
```

---

## Development Tips

### Hot Reload
- `npm run dev` watches both main and renderer
- Changes to main process require restart
- Changes to renderer auto-reload in Electron

### Build for Production
```bash
npm run build          # Compile TypeScript
npm run build:all      # Create installers (dmg, AppImage, exe)
```

### Run Tests
```bash
npm run test           # Watch mode
npm run test:run      # Single run
```

### Check Types
```bash
npx tsc --noEmit
```

---

## Next Steps After Installation

1. ✅ Enable Demo Mode in Admin → Settings
2. ✅ Test full kiosk flow (idle → package → payment → capture → frame → print → email → share)
3. ✅ Explore Admin panel features
4. ✅ Configure real hardware (camera, printer, email)
5. ✅ Customize frames (add PNG files to assets/frames/)
6. ✅ Package for distribution: `npm run build:all`

---

## Need Help?

- Full documentation: See `README.md`
- Features overview: See `FEATURES_SUMMARY.md`
- Architecture: See `IMPLEMENTATION_SUMMARY.md`
- Issues: Check logs in `logs/app.log`

---

**Enjoy building photobooths! 📸**

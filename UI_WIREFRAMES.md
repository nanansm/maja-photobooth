# Maja Photobooth - UI/UX Wireframes & Visual Guide

## Overall Design Language

**Theme:** Dark mode (black background) with gradient accents
**Primary Color:** `#0ea5e9` (blue-500) - configurable
**Typography:** Poppins (display), Inter (body)
**Touch-friendly:** Min 80px buttons, 24px+ text

---

## KIoSK SCREENS (Customer-Facing)

### Screen 1: IDLE SCREEN
```
┌─────────────────────────────────────┐
│            [GEAR ICON ⚙️]           │ ← Admin access (top-right)
│                                     │
│           ╭═══════════╮             │
│           │   📸     │             │
│           │   Logo    │             │
│           │  or Image │             │
│           ╰───────────╯             │
│                                     │
│     Maja Photobooth                 │
│     (Large Title - Poppins Bold)    │
│        48px+ text                   │
│                                     │
│     ┌─────────────────────┐         │
│     │  Sentuh untuk mulai  │         │
│     │       👆            │         │
│     └─────────────────────┘         │
│         (pulse animation)           │
│                                     │
│     [Background: gradient          │
│      from primary-900 to black]    │
│                                     │
│     [Floating particles animate]   │
└─────────────────────────────────────┘
```

**Features:**
- Auto-return after 60s
- Touch anywhere to continue
- Logo/configurable text
- Ambient particle animation

---

### Screen 2: PACKAGE SELECT
```
┌─────────────────────────────────────┐
│ ← Kembali                            │
├─────────────────────────────────────┤
│  Pilih Paket                         │
│  (Title - 32px)                     │
│                                     │
│  Pilih paket foto yang kamu suka    │
│  (Subtitle - gray)                  │
│                                     │
│  ┌─────────┐ ┌─────────┐           │
│  │ 🖼️     │ │ 🖼️     │           │
│  │ 1 Strip │ │ 2 Strip │           │
│  │ Rp15k   │ │ Rp25k   │           │
│  │         │ │         │           │
│  │ 📷4     │ │ 📷8     │           │
│  │ 🖨️1     │ │ 🖨️2     │           │
│  │ 💻Yes   │ │ 💻Yes   │           │
│  └─────────┘ └─────────┘           │
│     (Card hover: scale 1.05,       │
│      border-primary-500 glow)      │
│                                     │
│  ┌────────────────────────────┐    │
│  │     🖼️ Digital Only        │    │
│  │     Rp10k                  │    │
│  │     📷4                    │    │
│  │     (No print)             │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Features:**
- Grid of cards (responsive)
- Each card: icon, name, price (large), features
- "Tap for select" hover hint
- Active card has blue border & scale

---

### Screen 3: PAYMENT (QRIS)
```
┌─────────────────────────────────────┐
│ ← Batal                              │
├─────────────────────────────────────┤
│  Scan QR untuk Bayar                │
│  (Title)                            │
│                                     │
│  1 Strip Photo - Rp15.000           │
│                                     │
│          ╭═══════╮                  │
│          │  QR   │                  │
│          │ Code  │  (300x300px)     │
│          │       │   white bg       │
│          │       │   rounded-3xl    │
│          │       │   shadow-2xl     │
│          │       │   pulse-glow     │
│          ╰═══════╯                  │
│                                     │
│      04:58  ← countdown timer      │
│      (Large monospace font,        │
│       theme color)                 │
│                                     │
│  Buka app dompet digital,          │
│  scan QR di atas, konfirmasi       │
│                                     │
│  [🟢] [🔵] [🟡] [🟣]  (wallet icons)│
│                                     │
│  Status: ⏳ Menunggu pembayaran     │
│                                     │
└─────────────────────────────────────┘
```

**On Payment Confirmed:**
```
┌─────────────────────────────────────┐
│            ✅                       │
│   Pembayaran Berhasil!              │
│   (Green success screen)            │
│   Mohon tunggu sebentar...          │
└─────────────────────────────────────┘
```

---

### Screen 4: CAPTURE
```
┌─────────────────────────────────────┐
│  Foto 1 / 4      [← Kembali]       │
├─────────────────────────────────────┤
│                                     │
│   ╭─────────────────────────────╮   │
│   │                             │   │
│   │   LIVE PREVIEW              │   │
│   │   (Full-screen camera view) │   │
│   │                             │   │
│   ╰─────────────────────────────╯   │
│        Overlay:                     │
│        - Countdown 3/2/1 (center,  │
│          huge font, pulse anim)    │
│        - "Foto 1 / 4" at top-left  │
│                                     │
│                      ⭕  (Shutter)   │
│             (white circle button)   │
│                 80px diameter       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Siapkan pose!               │   │
│  │ Tekan tombol putih untuk    │   │
│  │ mengambil foto.            │   │
│  └─────────────────────────────┘   │
│        (bottom bar)                │
└─────────────────────────────────────┘
```

**During Countdown:**
- Full-screen white flash (shutter)
- "Click" sound
- Thumbnail appears in corner

---

### Screen 5: FRAME SELECT
```
┌─────────────────────────────────────┐
│ ← Retake                            │
├─────────────────────────────────────┤
│  Pilih Frame                        │
│                                     │
│  [Photo thumbnails row - 4 photos] │
│                                     │
│  Tampilkan semua frame              │
│  yang tersedia dalam grid           │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐           │
│  │ 🚫 │ │ 🖼️ │ │ 🖼️ │           │
│  │No  │ │Gld │ │Slv │           │
│  │Frame│ │Wed │ │Bday│           │
│  └─────┘ └─────┘ └─────┘           │
│                                     │
│  (Each frame card:                 │
│   - Preview image square           │
│   - Name label                     │
│   - Active: blue border + scale)   │
│                                     │
│  Filter by category: [All▼]        │
│  Filter color: [Original▼]         │
│                                     │
│  ┌────────────────────────────┐    │
│  │    Lanjutkan →             │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

### Screen 6: PROCESSING
```
┌─────────────────────────────────────┐
├─────────────────────────────────────┤
│  ╭──────────────────────────────╮   │
│  │         ╭──────╮              │   │
│  │         │      │              │   │
│  │         │ 75%  │              │   │
│  │         │      │              │   │
│  │         ╰──────╯              │   │
│  │         (progress circle)      │   │
│  ╰──────────────────────────────╯   │
│                                     │
│     Memproses foto...               │
│     Applying frame...              │
│     Creating print layout...       │
│                                     │
│  (Animated status messages)        │
└─────────────────────────────────────┘
```

---

### Screen 7: PREVIEW FINAL
```
┌─────────────────────────────────────┐
│ ← Pilih Frame Lain                  │
├─────────────────────────────────────┤
│  Preview Final                      │
│                                     │
│      ╭──────────────────╮          │
│      │                  │          │
│      │   [Processed     │          │
│      │    Photo]        │          │
│      │    (Large)       │          │
│      │                  │          │
│      ╰──────────────────╯          │
│                                     │
│  1 Strip Photo - 4 foto             │
│                                     │
│  ┌────────────┐ ┌────────────┐    │
│  │ 🖨️ Cetak   │ │ 📧 Kirim   │    │
│  │ Saja       │ │ Email      │    │
│  └────────────┘ └────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │   🖨️📧 Cetak & Kirim Email│    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

### Screen 8: PRINT
```
┌─────────────────────────────────────┐
│  Cetak Foto                          │
│  Printing 2 copies to Epson D530    │
├─────────────────────────────────────┤
│  [Printer Card]                     │
│  Printer: ▾ Epson SureLab D530      │
│                                     │
│  ╭──────────────────────────────╮   │
│  │  [Dropdown list of printers] │   │
│  │  ✓ Epson SureLab D530        │   │
│  │    Online                    │   │
│  │  Canon SELPHY CP1300         │   │
│  │    Offline                   │   │
│  ╰──────────────────────────────╯   │
│                                     │
│  ╭──────────────────────────────╮   │
│  │  Status: Printing complete! ✓│   │
│  │  Ambil fotomu di printer ya  │   │
│  │  📷                          │   │
│  ╰──────────────────────────────╯   │
│                                     │
│  ┌────────────────────────────┐    │
│  │ Lanjut Kirim Email →       │    │
│  └────────────────────────────┘    │
│                                     │
│  [Skip Email → Download]            │
└─────────────────────────────────────┘
```

---

### Screen 9: EMAIL INPUT
```
┌─────────────────────────────────────┐
│ ← Kembali                            │
├─────────────────────────────────────┤
│  Input Email                         │
│  Langkah 7 dari 9                   │
├─────────────────────────────────────┤
│  Ketik email kamu di keyboard di   │
│  bawah, lalu tombol "Done"         │
│                                     │
│  ╭─────────────────────────────╮    │
│  │                             │    │
│  │  [email@domain.com]        │    │
│  │  (Large display, 32px)     │    │
│  │                             │    │
│  ╰─────────────────────────────╯    │
│                                     │
│  [VIRTUAL KEYBOARD]                 │
│  1 2 3 4 5 6 7 8 9 0                │
│   q w e r t y u i o p               │
│    a s d f g h j k l               │
│     z x c v b n m                  │
│    @ . - _  [Space]  [Done]        │
│                                     │
│  ╭─────────────────────────────╮    │
│  │            ✗                │    │
│  │  Email tidak valid          │    │
│  ╰─────────────────────────────╯    │
│                                     │
│  ┌──────────────┬─────────────────┐│
│  │  Lewati      │  Kirim Email   ││
│  │              │   📧          ││
│  └──────────────┴─────────────────┘│
│      (skip)       (primary)        │
└─────────────────────────────────────┘
```

**Virtual Keyboard:**
- Touch-optimized keys
- Space = wide button
- Done = closes keyboard & submits
- Backspace separate wide button below

---

### Screen 10: SHARE (DOWNLOAD)
```
┌─────────────────────────────────────┐
├─────────────────────────────────────┤
│   📱    Ambil Foto Digital          │
│                                     │
│   Scan QR code untuk download       │
│   ke smartphone                    │
│                                     │
│      ╭──────────────╮               │
│      │   [QR CODE]  │               │
│      │   300x300    │               │
│      │   white bg   │               │
│      ╰──────────────╯               │
│                                     │
│   Kembali ke idle dalam 9 detik...  │
│   (countdown)                       │
│                                     │
│  ╭─────────────────────────────╮    │
│  │ https://demo.openphot...    │    │
│  └─────────────────────────────╘    │
│  [Copy]                             │
│                                     │
│  ┌────────────────────────────┐    │
│  │     Selesai Sekarang →     │    │
│  └────────────────────────────┘    │
│                                     │
│  Link aktif selama 30 hari         │
└─────────────────────────────────────┘
```

---

### Screen 11: COMPLETE
```
┌─────────────────────────────────────┐
├─────────────────────────────────────┤
│              ✅                     │
│      Terima Kasih!                  │
│      (Title - 48px bold)            │
│                                     │
│     Semoga harimu menyenangkan     │
│     (Subtitle - 24px)               │
│                                     │
│        [Final photo displayed]     │
│                                     │
│  ┌────────────────────────────┐    │
│  │     Selesai                │    │
│  │     (pulse-glow button)    │    │
│  └────────────────────────────┘    │
│                                     │
│  (Auto-return to idle after 3s)    │
└─────────────────────────────────────┘
```

---

## ADMIN PANEL SCREENS

### Admin Layout (All Pages)
```
┌─────────────────────────────────────────────────────┐
│  🖼️ Maja Photobooth Admin    [Logout]              │
├─────────────────────────────────────────────────────┤
│ [Dashboard] [Paket] [Frame] [Settings] [History]  │
├─────────────────────────────────────────────────────┤
│                                                    │
│   [Page Content - Dynamic]                         │
│                                                    │
│                                                    │
└─────────────────────────────────────────────────────┘
```

---

### Dashboard

**Top - Metric Cards (3-4 cards):**
```
┌───────────┐ ┌───────────┐
│ Total     │ │ Total     │
│ Revenue   │ │ Sessions  │
│ Rp 1.5M   │ │ 45 today  │
│ (+12%)    │ │ (+5%)     │
└───────────┘ └───────────┘
```

**Status Indicators:**
```
Camera: 🟢 Canon EOS R100 (Connected)
Printer: 🟢 Epson SureLab D530 (Ready, 100 sheets)
Xendit: 🟢 API Connected
Email: 🟢 Connected (gmail.com)
```

**Charts (placeholders):**
- Line chart: Revenue last 7 days
- Bar chart: Sessions by hour today
- Pie chart: Package distribution

**Live Activity Log:**
```
Time          Event       Details
14:23:45      Payment     Invoice inv_xxx paid - Rp25k
14:22:10      Print       Job #123 completed
14:21:05      Session     New session started (package: 2Strip)
```

---

### Settings (Multi-Section)

```
1️⃣ 💳 Payment (Xendit)
   ├─ Secret API Key:  [••••••••••••••••]  [Test]
   ├─ Callback Token:  [••••••••••••••••]
   ├─ Webhook Port:    [3847]
   └─ Sandbox/Production toggle

2️⃣ 📧 Email (SMTP)
   ├─ Provider: [Gmail ▼]
   ├─ Host: [smtp.gmail.com]
   ├─ Port: [587]
   ├─ Username: [your-email@gmail.com]
   ├─ Password: [App Password]
   ├─ From Name: [Photobooth Kami]
   └─ [Test Send] [Preview Template]

3️⃣ 🔔 Notifications
   ├─ ☑ Enable desktop notifications
   ├─ ☑ Play sound
   └─ Telegram Bot:
      ├─ Bot Token: [••••••••••••••••]
      ├─ Chat ID:   [••••••••••••••••]
      └─ [Send Test]

4️⃣ ☁️ Cloud Storage
   ├─ Provider: [Cloudinary ▼]
   ├─ Cloud Name: [...]
   ├─ API Key: [...]
   └─ [Test Upload]

5️⃣ 🖥️ Display
   ├─ Theme Color: [#0ea5e9] [🎨]
   ├─ Idle Text: [Sentuh untuk mulai]
   ├─ Logo: [Upload...]
   └─ Background Music: [Upload MP3]

6️⃣ 🔧 Hardware
   ├─ Default Camera: [Canon EOS R100 ▼]
   ├─ Test Capture: [📸 Capture Test]
   └─ Default Printer: [Epson D530 ▼] [Test Print]

7️⃣ 🔐 Admin
   ├─ Admin Password: [••••••••]
   └─ ☑ Demo Mode
```

---

## DESIGN SYSTEM

### Colors
```css
Primary: #0ea5e9 (blue-500)
Success: #10b981 (green-500)
Warning: #f59e0b (amber-500)
Error: #ef4444 (red-500)
Background: #000000 (black)
Surface: #1f2937 (gray-800)
Text: #ffffff (white)
Text-muted: #9ca3af (gray-400)
```

### Typography
- **H1 (Screen titles):** Poppins Bold, 36-48px
- **H2 (Section titles):** Poppins SemiBold, 28-32px
- **Body:** Inter Regular, 18-24px
- **Button:** Inter SemiBold, 20-24px

### Spacing
- XS: 8px
- SM: 16px
- MD: 24px
- LG: 32px
- XL: 48px

### Border Radius
- SM: 8px
- MD: 16px (buttons)
- LG: 24px (cards)
- XL: 32px (modals)

---

## ANIMATIONS

### Transitions
```css
.button Hover: scale(1.05)
.button Active: scale(0.95)
Screen: fade 300ms ease
Card: hover -> border-primary-500 glow
```

### Loading States
- Spinner: `animate-spin rounded-full border-b-4`
- Progress: Circle with `clip-path` animation
- Skeleton: shimmer effect

### Countdown
- Pulse animation: `animate-pulse`
- Scale: 1.5 → 1 → 0.8 (3-2-1)
- Sound: Web Audio oscillator beep

---

## TOUCH OPTIMIZATION

**Button Sizes:**
- Min height: 80px
- Min width: 120px (or square 80px)
- Touch area padding: 16px
- Gap between buttons: 16px

**Form Inputs:**
- Height: 56px+
- Font size: 20px+
- On-screen keyboard support

**Scroll:**
- Touch scroll in frame list
- Prevent body scroll when modal open

---

## ACCESSIBILITY

- High contrast (white on black)
- Large touch targets
- Clear visual feedback
- Screen reader labels (aria-labels)
- Keyboard navigation (optional)

---

## READY TO TEST?

1. Run: `npm run dev`
2. App opens in fullscreen Electron
3. Click anywhere to start kiosk flow
4. Click ⚙️ → password: `changeme123` → explore Admin
5. Enable Demo Mode to test without hardware

---

**All screens designed for touch interfaces with large elements, clear hierarchy, and smooth animations!** 🎨✨

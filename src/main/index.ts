import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { join } from 'path';
import { DatabaseService } from './db/DatabaseService';
import { registerIpcHandlers } from './handlers';
import { PaymentService } from './payment/XenditService';
import { getNotificationService } from './notification/NotificationService';

let mainWindow: BrowserWindow | null = null;
let dbService: DatabaseService;
let paymentService: PaymentService;
let notificationService = getNotificationService();

// Keep a global reference to avoid garbage collection
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: true,
    kiosk: false, // Can be enabled via config
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#000000',
    show: false
  });

  // Load the app
  if (process.env.NODE_ENV === 'development' || app.isPackaged === false) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set main window for notification service
  notificationService.setMainWindow(mainWindow);

  // Handle webhook requests (Xendit callback)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // This is just to keep the main process alive
  });
}

// Initialize database
function initializeDatabase() {
  dbService = new DatabaseService();
  dbService.connect();
  dbService.initialize();
  console.log('Database initialized');
}

// Initialize payment service and webhook
async function initializePayment() {
  paymentService = new PaymentService();

  // Load config to get webhook settings
  const config = paymentService.getConfig();

  if (config.secretKey) {
    try {
      await paymentService.startWebhookServer(async (invoiceId, sessionId) => {
        console.log(`Payment confirmed for invoice ${invoiceId}, session ${sessionId}`);

        // Send desktop notification
        notificationService.send({
          type: 'payment',
          title: 'Pembayaran Diterima',
          message: `Invoice ${invoiceId} telah dibayar. Selamat menikmati sesi photobooth!`,
          data: { invoiceId, sessionId }
        });

        // Notify renderer
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('payment:confirmed', {
            id: sessionId,
            paymentStatus: 'paid',
            xenditInvoiceId: invoiceId
          });
        }
      });

      console.log('Payment webhook server started');
    } catch (error) {
      console.error('Failed to start webhook server:', error);
    }
  } else {
    console.log('Payment not configured (no API key)');
  }
}

// App event handlers
app.whenReady().then(async () => {
  console.log(`Starting Maja Photobooth v${app.getVersion()}`);

  // Initialize services
  initializeDatabase();

  // Register IPC handlers (must be before creating window)
  registerIpcHandlers();

  // Initialize payment
  await initializePayment();

  // Create main window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    cleanup();
  }
});

app.on('before-quit', () => {
  cleanup();
});

function cleanup() {
  console.log('Shutting down...');

  if (paymentService) {
    paymentService.stopWebhookServer();
  }

  if (dbService) {
    dbService.close();
  }

  // Force quit after small delay
  setTimeout(() => {
    app.exit(0);
  }, 1000);
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

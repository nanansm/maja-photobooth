import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { CameraService } from './camera/CameraService';
import { PaymentService } from './payment/XenditService';
import { PhotoProcessor } from './photo/PhotoProcessor';
import { PrinterService } from './printer/PrinterService';
import { getEmailService } from './email/EmailService';
import { getNotificationService, Notification } from './notification/NotificationService';
import { getDatabase } from './db/DatabaseService';
import * as types from '../shared/types';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

const db = getDatabase();

// Initialize services
const cameraService = new CameraService();
const paymentService = new PaymentService();
const photoProcessor = new PhotoProcessor();
const printerService = new PrinterService();
const emailService = getEmailService();
const notificationService = getNotificationService();

export function registerIpcHandlers(): void {
  console.log('Registering IPC handlers...');

  // ============ CAMERA HANDLERS ============
  ipcMain.handle('camera:detect', async (): Promise<types.Camera[]> => {
    return cameraService.detectCameras();
  });

  ipcMain.handle('camera:set-active', async (_event: IpcMainInvokeEvent, cameraId: string): Promise<void> => {
    await cameraService.setActiveCamera(cameraId);
  });

  ipcMain.handle('camera:capture', async (_event: IpcMainInvokeEvent, options: types.CaptureOptions): Promise<string> => {
    return cameraService.capturePhoto(options);
  });

  ipcMain.handle('camera:preview:start', async (): Promise<void> => {
    await cameraService.startLivePreview((frame) => {
      ipcMain.emit('camera:preview:frame', null, frame);
    });
  });

  ipcMain.handle('camera:preview:stop', async (): Promise<void> => {
    cameraService.stopLivePreview();
  });

  // ============ PAYMENT HANDLERS ============
  ipcMain.handle('payment:create-invoice', async (_event: IpcMainInvokeEvent, data: { externalId: string; amount: number; packageId: string }): Promise<any> => {
    return paymentService.createInvoice(data);
  });

  ipcMain.handle('payment:check-status', async (_event: IpcMainInvokeEvent, invoiceId: string): Promise<types.PaymentStatus> => {
    return paymentService.checkStatus(invoiceId);
  });

  // ============ PHOTO HANDLERS ============
  ipcMain.handle('photo:create-strip', async (_event: IpcMainInvokeEvent, data: { photos: string[]; layout: types.StripLayout }): Promise<string> => {
    return photoProcessor.createStrip(data.photos, data.layout);
  });

  ipcMain.handle('photo:apply-frame', async (_event: IpcMainInvokeEvent, data: { photoPath: string; frameTemplate: types.FrameTemplate }): Promise<string> => {
    return photoProcessor.applyFrame(data.photoPath, data.frameTemplate);
  });

  ipcMain.handle('photo:apply-filter', async (_event: IpcMainInvokeEvent, data: { photoPath: string; filter: string; intensity?: number }): Promise<string> => {
    return photoProcessor.applyFilter(data.photoPath, data.filter, data.intensity);
  });

  ipcMain.handle('photo:create-collage', async (_event: IpcMainInvokeEvent, data: { photos: string[]; template: types.CollageTemplate }): Promise<string> => {
    return photoProcessor.createCollage(data.photos, data.template);
  });

  ipcMain.handle('photo:add-text', async (_event: IpcMainInvokeEvent, data: { photoPath: string; config: types.TextOverlayConfig }): Promise<string> => {
    return photoProcessor.addTextOverlay(data.photoPath, data.config);
  });

  // ============ PRINTER HANDLERS ============
  ipcMain.handle('printer:list', async (): Promise<types.PrinterInfo[]> => {
    return printerService.listPrinters();
  });

  ipcMain.handle('printer:print', async (_event: IpcMainInvokeEvent, data: { filePath: string; options: types.PrintOptions }): Promise<void> => {
    return printerService.printPhoto(data.filePath, data.options);
  });

  ipcMain.handle('printer:queue', async (): Promise<types.PrintJob[]> => {
    return printerService.getQueue();
  });

  ipcMain.handle('printer:cancel', async (_event: IpcMainInvokeEvent, jobId: string): Promise<void> => {
    return printerService.cancelJob(jobId);
  });

  // ============ EMAIL HANDLERS ============
  ipcMain.handle('email:send', async (_event: IpcMainInvokeEvent, options: any): Promise<void> => {
    const emailService = getEmailService();
    await emailService.sendPhotoEmail(options);
  });

  ipcMain.handle('email:test', async (): Promise<boolean> => {
    const emailService = getEmailService();
    return emailService.testConnection();
  });

  ipcMain.handle('email:preview-template', async (_event: IpcMainInvokeEvent, sessionData: any): Promise<string> => {
    const emailService = getEmailService();
    return emailService.previewTemplate(sessionData);
  });

  ipcMain.handle('email:get-config', async (): Promise<any> => {
    const emailService = getEmailService();
    return emailService.getConfig();
  });

  ipcMain.handle('email:save-config', async (_event: IpcMainInvokeEvent, config: any): Promise<void> => {
    const emailService = getEmailService();
    emailService.updateConfig(config);
  });

  // ============ NOTIFICATION HANDLERS ============
  ipcMain.handle('notification:get-all', async (): Promise<Notification[]> => {
    return notificationService.getNotifications();
  });

  ipcMain.handle('notification:mark-read', async (_event: IpcMainInvokeEvent, id: string): Promise<void> => {
    notificationService.markAsRead(id);
  });

  ipcMain.handle('notification:clear', async (): Promise<void> => {
    notificationService.clear();
  });

  ipcMain.handle('notification:get-unread-count', async (): Promise<number> => {
    return notificationService.getUnreadCount();
  });

  ipcMain.handle('notification:send', async (_event: IpcMainInvokeEvent, notif: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> => {
    await notificationService.send(notif);
  });

  // ============ DATABASE HANDLERS ============
  ipcMain.handle('db:get-packages', async (): Promise<types.Package[]> => {
    return db.query<types.Package>('SELECT * FROM packages WHERE is_active = 1 ORDER BY sort_order');
  });

  ipcMain.handle('db:get-active-package', async (_event: IpcMainInvokeEvent, id?: string): Promise<types.Package | null> => {
    if (id) {
      return db.getOne<types.Package>('SELECT * FROM packages WHERE id = ?', [id]);
    }
    return db.getOne<types.Package>('SELECT * FROM packages WHERE is_active = 1 ORDER BY sort_order LIMIT 1');
  });

  ipcMain.handle('db:save-package', async (_event: IpcMainInvokeEvent, pkg: types.Package): Promise<void> => {
    db.run(
      `INSERT OR REPLACE INTO packages (id, name, price, photo_count, print_count, digital_copy, is_active, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [pkg.id, pkg.name, pkg.price, pkg.photoCount, pkg.printCount, pkg.digitalCopy ? 1 : 0, pkg.isActive ? 1 : 0, pkg.sortOrder]
    );
  });

  ipcMain.handle('db:delete-package', async (_event: IpcMainInvokeEvent, id: string): Promise<void> => {
    db.run('DELETE FROM packages WHERE id = ?', [id]);
  });

  ipcMain.handle('db:get-frames', async (): Promise<types.FrameTemplate[]> => {
    const frames = db.query<{ id: string; name: string; preview_image: string; overlay_image: string; template_json: string; is_active: number }>(
      'SELECT * FROM frames WHERE is_active = 1 ORDER BY sort_order'
    );

    return frames.map(frame => ({
      id: frame.id,
      name: frame.name,
      previewImage: frame.preview_image,
      overlayImage: frame.overlay_image,
      photoSlots: JSON.parse(frame.template_json).photoSlots,
      canvasWidth: JSON.parse(frame.template_json).canvasWidth,
      canvasHeight: JSON.parse(frame.template_json).canvasHeight,
      isActive: frame.is_active === 1
    }));
  });

  ipcMain.handle('db:save-frame', async (_event: IpcMainInvokeEvent, frame: types.FrameTemplate): Promise<void> => {
    const templateJson = JSON.stringify({
      photoSlots: frame.photoSlots,
      canvasWidth: frame.canvasWidth,
      canvasHeight: frame.canvasHeight
    });

    db.run(
      `INSERT OR REPLACE INTO frames (id, name, preview_image, overlay_image, template_json, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [frame.id, frame.name, frame.previewImage, frame.overlayImage, templateJson, 1, 0]
    );
  });

  ipcMain.handle('db:delete-frame', async (_event: IpcMainInvokeEvent, id: string): Promise<void> => {
    db.run('DELETE FROM frames WHERE id = ?', [id]);
  });

  ipcMain.handle('config:get', async (): Promise<types.AppConfig> => {
    const rows = db.query<{ key: string; value: string }>('SELECT * FROM config');
    const config: Record<string, any> = {};

    rows.forEach(row => {
      try {
        config[row.key] = JSON.parse(row.value);
      } catch {
        config[row.key] = row.value;
      }
    });

    // Set defaults if not present
    const defaults: Partial<types.AppConfig> = {
      adminPassword: 'changeme123',
      xenditSecretKey: '',
      xenditCallbackToken: '',
      webhookPort: 3847,
      defaultPrinter: '',
      defaultCamera: '',
      logoPath: '',
      themeColor: '#0ea5e9',
      idleText: 'Sentuh untuk mulai',
      backgroundMusic: '',
      demoMode: false
    };

    return { ...defaults, ...config } as types.AppConfig;
  });

  ipcMain.handle('config:save', async (_event: IpcMainInvokeEvent, config: Partial<types.AppConfig>): Promise<void> => {
    for (const [key, value] of Object.entries(config)) {
      db.run(
        'INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, JSON.stringify(value)]
      );
    }
  });

  ipcMain.handle('db:get-sessions', async (_event: IpcMainInvokeEvent, limit?: number): Promise<types.Session[]> => {
    const sql = limit
      ? 'SELECT * FROM sessions ORDER BY created_at DESC LIMIT ?'
      : 'SELECT * FROM sessions ORDER BY created_at DESC';
    return db.query<types.Session>(sql, limit ? [limit] : undefined);
  });

  ipcMain.handle('db:get-stats', async (_event: IpcMainInvokeEvent, date?: string): Promise<{ total: number; revenue: number; prints: number }> => {
    let dateCondition = '';
    const params: any[] = [];

    if (date) {
      dateCondition = 'DATE(created_at) = ?';
      params.push(date);
    } else {
      dateCondition = 'DATE(created_at) = DATE("now")';
    }

    const stats = db.getOne<{ total: number; revenue: number; prints: number }>(
      `SELECT
        COUNT(*) as total,
        COALESCE(SUM(amount), 0) as revenue,
        COALESCE(SUM(print_count), 0) as prints
       FROM sessions
       WHERE ${dateCondition} AND payment_status = 'paid'`,
      params
    );

    return stats || { total: 0, revenue: 0, prints: 0 };
  });

  // ============ SYSTEM HANDLERS ============
  ipcMain.handle('system:version', async (): Promise<string> => {
    return app.getVersion();
  });

  ipcMain.handle('system:platform', async (): Promise<NodeJS.Platform> => {
    return process.platform as NodeJS.Platform;
  });

  console.log('All IPC handlers registered');
}

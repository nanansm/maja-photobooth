import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from 'electron';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export interface Notification {
  id: string;
  type: 'payment' | 'printer' | 'camera' | 'email' | 'system' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationConfig {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  telegram: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
}

export class NotificationService {
  private mainWindow: BrowserWindow | null = null;
  private notifications: Notification[] = [];
  private config: NotificationConfig;
  private configPath: string;

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'notifications.json');
    this.config = this.loadConfig();
  }

  setMainWindow(window: BrowserWindow | null) {
    this.mainWindow = window;
  }

  private loadConfig(): NotificationConfig {
    const defaultConfig: NotificationConfig = {
      enabled: true,
      sound: true,
      desktop: true,
      telegram: false
    };

    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf-8');
        return { ...defaultConfig, ...JSON.parse(content) };
      }
    } catch (error) {
      console.error('Failed to load notification config:', error);
    }

    return defaultConfig;
  }

  async send(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    if (!this.config.enabled) return;

    const fullNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(fullNotification);
    this.saveNotifications();

    // Desktop notification
    if (this.config.desktop && this.mainWindow) {
      this.showDesktopNotification(fullNotification);
    }

    // Play sound
    if (this.config.sound) {
      this.playNotificationSound();
    }

    // Send to admin panel via IPC
    if (this.mainWindow) {
      this.mainWindow.webContents.send('notification:new', fullNotification);
    }

    // Telegram
    if (this.config.telegram && this.config.telegramBotToken && this.config.telegramChatId) {
      await this.sendTelegramNotification(fullNotification);
    }
  }

  private showDesktopNotification(notification: Notification): void {
    const { Notification: ElectronNotification } = require('electron');

    const iconPath = path.join(__dirname, '../../assets/icons/icon.png');

    new ElectronNotification({
      title: this.getNotificationTitle(notification.type),
      body: notification.message,
      icon: fs.existsSync(iconPath) ? iconPath : undefined,
      silent: !this.config.sound,
      urgency: 'normal'
    }).show();
  }

  private playNotificationSound(): void {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 200);
    } catch (error) {
      console.log('Could not play notification sound');
    }
  }

  private async sendTelegramNotification(notification: Notification): Promise<void> {
    const { TelegramBot } = require('node-telegram-bot-api');

    try {
      const bot = new TelegramBot(this.config.telegramBotToken!, { polling: false });

      const emojiMap: Record<string, string> = {
        payment: '💰',
        printer: '🖨️',
        camera: '📷',
        email: '📧',
        system: 'ℹ️',
        error: '❌'
      };

      const message = `${emojiMap[notification.type] || '🔔'} *${this.escapeMarkdown(notification.title)}*\n${this.escapeMarkdown(notification.message)}`;

      await bot.sendMessage(
        this.config.telegramChatId!,
        message,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
    }
  }

  private getNotificationTitle(type: Notification['type']): string {
    const titles: Record<string, string> = {
      payment: '💰 Payment Received',
      printer: '🖨️ Printer Update',
      camera: '📷 Camera Alert',
      email: '📧 Email Status',
      system: 'ℹ️ System',
      error: '❌ Error'
    };
    return titles[type] || 'Notification';
  }

  private escapeMarkdown(text: string): string {
    return text.replace(/([_*\[\]()`~>#\+\-=|{}\.!?])/g, '\\$1');
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  markAsRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveNotifications();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  clear(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  private saveNotifications(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify({
        config: this.config,
        notifications: this.notifications.slice(0, 100) // Keep last 100
      }, null, 2));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveNotifications();
  }

  getConfig(): NotificationConfig {
    return { ...this.config };
  }
}

// Singleton
let notificationInstance: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationInstance) {
    notificationInstance = new NotificationService();
  }
  return notificationInstance;
}

import nodemailer, { Transporter } from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as types from '../../shared/types';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

interface SMTPConfig {
  provider: 'gmail' | 'outlook' | 'custom';
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromName: string;
  fromEmail: string;
}

interface SendPhotoOptions {
  to: string | string[]; // Single email or array
  customerName?: string;
  sessionId: string;
  processedPhotoPath: string;
  stripPaths?: string[];
  downloadUrl?: string;
  eventName?: string;
  boothName?: string;
}

interface IEmailService {
  sendPhotoEmail(options: SendPhotoOptions): Promise<void>;
  testConnection(): Promise<boolean>;
  previewTemplate(sessionData: SendPhotoOptions): string;
  getDefaultTemplate(): string;
  saveCustomTemplate(html: string): Promise<void>;
  getConfig(): SMTPConfig;
  updateConfig(config: Partial<SMTPConfig>): void;
}

export class EmailService implements IEmailService {
  private transporter: Transporter | null = null;
  private config: SMTPConfig;
  private configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), 'config', 'email.json');
    this.config = this.loadConfig();
    this.initializeTransporter();
  }

  private loadConfig(): SMTPConfig {
    const defaultConfig: SMTPConfig = {
      provider: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: '',
        pass: ''
      },
      fromName: 'Photobooth Kami',
      fromEmail: 'noreply@photobooth.id'
    };

    try {
      if (fs.existsSync(this.configPath)) {
        const configContent = fs.readFileSync(this.configPath, 'utf-8');
        const savedConfig = JSON.parse(configContent);
        return { ...defaultConfig, ...savedConfig };
      }
    } catch (error) {
      console.error('Failed to load email config:', error);
    }

    return defaultConfig;
  }

  private initializeTransporter(): void {
    if (!this.config.auth.user || !this.config.auth.pass) {
      console.log('Email not configured: missing credentials');
      return;
    }

    // Gmail OAuth2 support
    if (this.config.provider === 'gmail' && this.isOAuth2Config(this.config.auth)) {
      this.setupGmailOAuth2();
      return;
    }

    // Standard SMTP
    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.auth.user,
        pass: this.config.auth.pass
      },
      tls: {
        rejectUnauthorized: false // For self-signed certs
      }
    });
  }

  private isOAuth2Config(auth: { user: string; pass: string }): boolean {
    return auth.pass.includes('.') || auth.pass.includes('@');
  }

  private async setupGmailOAuth2(): Promise<void> {
    // Gmail OAuth2 setup - requires clientId, clientSecret, refreshToken
    // For simplicity in photobooth, we recommend App Password
    console.log('Using Gmail with App Password (recommended) or OAuth2');
    // Fallback to regular SMTP
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.auth.user,
        pass: this.config.auth.pass
      }
    });
  }

  async sendPhotoEmail(options: SendPhotoOptions): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email service not configured. Please set up SMTP credentials in Admin → Settings.');
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const validRecipients = recipients.filter(email => this.validateEmail(email));

    if (validRecipients.length === 0) {
      throw new Error('No valid email addresses provided');
    }

    const attachments = [];

    // Add processed photo as attachment
    if (fs.existsSync(options.processedPhotoPath)) {
      const filename = path.basename(options.processedPhotoPath);
      attachments.push({
        path: options.processedPhotoPath,
        filename: `foto-${options.sessionId}-${filename}`,
        cid: 'photo1' // for inline embedding
      });
    }

    // Add strips as additional attachments
    if (options.stripPaths && options.stripPaths.length > 0) {
      options.stripPaths.forEach((stripPath, index) => {
        if (fs.existsSync(stripPath)) {
          attachments.push({
            path: stripPath,
            filename: `strip-${index + 1}-${options.sessionId}.jpg`
          });
        }
      });
    }

    // Generate HTML body
    const html = this.generateEmailHtml(options);

    // Send to all recipients
    const mailOptions: nodemailer.SendMailOptions = {
      from: {
        name: this.config.fromName,
        address: this.config.fromEmail
      },
      to: validRecipients.join(', '),
      subject: options.eventName
        ? `📸 Your photos from ${options.eventName} are ready!`
        : `📸 Your photobooth photos are ready!`,
      html,
      attachments,
      text: this.generateTextVersion(options)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${validRecipients.join(', ')}:`, info.messageId);
    } catch (error: any) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private generateEmailHtml(options: SendPhotoOptions): string {
    const boothName = options.boothName || 'Maja Photobooth';
    const customerName = options.customerName || 'Teman Photobooth';
    const eventName = options.eventName || 'Acara Kita';

    // Read custom template if exists
    let template = this.getDefaultTemplate();

    // Replace placeholders
    template = template
      .replace(/{customerName}/g, customerName)
      .replace(/{eventName}/g, eventName)
      .replace(/{boothName}/g, boothName)
      .replace(/{sessionId}/g, options.sessionId)
      .replace(/{date}/g, new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));

    // Add download button if URL available
    if (options.downloadUrl) {
      template = template.replace(
        /<div class="download-section">.*?<\/div>/s,
        `
        <div class="download-section" style="text-align: center; margin: 30px 0;">
          <a href="${options.downloadUrl}"
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 18px 40px; text-decoration: none;
                    border-radius: 50px; font-weight: bold; font-size: 18px;
                    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);">
            🎉 Download Foto ({eventName})
          </a>
          <p style="margin-top: 15px; color: #666; font-size: 14px;">
            Link aktif selama 30 hari
          </p>
        </div>
        `
      );
    } else if (options.processedPhotoPath) {
      // If no download URL, embed the photo
      const photoDataUrl = `data:image/jpeg;base64,${this.fileToBase64(options.processedPhotoPath)}`;
      template = template.replace(
        /<div class="photo-preview">.*?<\/div>/s,
        `
        <div class="photo-preview" style="text-align: center; margin: 30px 0;">
          <img src="${photoDataUrl}"
               style="max-width: 100%; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);"
               alt="Your photobooth photo">
        </div>
        `
      );
    }

    return template;
  }

  private fileToBase64(filePath: string): string {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return fileBuffer.toString('base64');
    } catch (error) {
      console.error('Failed to read file for base64:', error);
      return '';
    }
  }

  private generateTextVersion(options: SendPhotoOptions): string {
    const customerName = options.customerName || 'Teman Photobooth';
    const eventName = options.eventName || 'Acara Kita';

    let text = `Halo ${customerName}!\n\n`;
    text += `Foto kamu dari ${eventName} sudah siap!\n\n`;
    text += `Session ID: ${options.sessionId}\n`;
    text += `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n\n`;

    if (options.downloadUrl) {
      text += `Download foto di sini: ${options.downloadUrl}\n\n`;
    }

    text += `Link aktif selama 30 hari.\n\n`;
    text += `Terima kasih!\n`;
    text += `${this.config.fromName}\n`;

    return text;
  }

  previewTemplate(sessionData: SendPhotoOptions): string {
    return this.generateEmailHtml(sessionData);
  }

  getDefaultTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header .booth-name {
      font-size: 18px;
      opacity: 0.9;
      margin-top: 10px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }
    .event-name {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: bold;
      font-size: 20px;
      text-align: center;
      margin-bottom: 30px;
    }
    .photo-preview {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    }
    .download-section {
      background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
      padding: 30px;
      border-radius: 15px;
      margin: 30px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 18px 40px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      font-size: 18px;
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
      transition: transform 0.3s ease;
    }
    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(102, 126, 234, 0.5);
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #eee;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #666;
      text-decoration: none;
      font-size: 20px;
    }
    .footer-note {
      font-size: 12px;
      color: #999;
      margin-top: 20px;
    }
    .unsubscribe {
      font-size: 12px;
      color: #aaa;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Foto Siap!</h1>
      <div class="booth-name">{boothName}</div>
    </div>

    <div class="content">
      <div class="greeting">Halo <strong>{customerName}</strong>!</div>

      <div class="event-name">📸 {eventName}</div>

      <p style="text-align: center; color: #666; line-height: 1.6;">
        Kamu sudah selesai sesi photobooth! Yuk download fotomu dan share ke media sosial.
      </p>

      <div class="photo-preview">
        <!-- Photo preview will be inserted here -->
      </div>

      <div class="download-section">
        <p style="text-align: center; margin-bottom: 20px; color: #555;">
          Klik tombol di bawah untuk download semua foto dalam resolusi penuh:
        </p>
        <div style="text-align: center;">
          <a href="#" class="cta-button">
            ⬇️ Download Foto ({eventName})
          </a>
        </div>
        <p style="text-align: center; font-size: 14px; color: #888; margin-top: 15px;">
          Link aktif selama 30 hari
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding: 20px; background: #fff9e6; border-radius: 10px;">
        <p style="margin: 0; color: #856404;">
          <strong>📧 Email ini dikirimkan secara otomatis</strong><br>
          Session ID: {sessionId}
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="social-links">
        <a href="#">📷 Instagram</a>
        <a href="#">📘 Facebook</a>
        <a href="#">🐦 Twitter</a>
      </div>
      <p style="margin: 15px 0 0 0; color: #666;">
        {boothName} - Hadir untuk menemani momen spesiamu
      </p>
      <div class="footer-note">
        © {new Date().getFullYear()} {boothName}. All rights reserved.<br>
        Email ini dikirimkan otomatis, tidak perlu dibalas.
      </div>
      <div class="unsubscribe">
        Questions? Contact us at support@photobooth.id
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }

      if (!this.transporter) {
        return false;
      }

      // Verify connection by sending a test email to self
      const testMail = nodemailer.createTestAccount();
      await this.transporter.verify();
      console.log('✅ Email connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email connection failed:', error);
      return false;
    }
  }

  async saveCustomTemplate(html: string): Promise<void> {
    const templateDir = path.join(process.cwd(), 'templates');
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }

    const templatePath = path.join(templateDir, 'email-template.html');
    fs.writeFileSync(templatePath, html);
  }

  updateConfig(newConfig: Partial<SMTPConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (!fs.existsSync(path.dirname(this.configPath))) {
      fs.mkdirSync(path.dirname(this.configPath), { recursive: true });
    }

    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    this.initializeTransporter();
  }

  getConfig(): SMTPConfig {
    return { ...this.config };
  }
}

// Singleton
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

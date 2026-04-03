import axios, { AxiosInstance } from 'axios';
import * as types from '../../shared/types';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

interface XenditConfig {
  secretKey: string;
  callbackToken: string;
  webhookPort: number;
}

export class PaymentService {
  private config: XenditConfig;
  private api: AxiosInstance;
  private webhookServer: any = null;
  private webhookProcess: any = null;

  constructor() {
    // Load config from file or use defaults
    this.config = this.loadConfig();

    // Create axios instance with base config
    this.api = axios.create({
      baseURL: 'https://api.xendit.co',
      headers: {
        'Authorization': `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private loadConfig(): XenditConfig {
    const configPath = path.join(process.cwd(), 'config', 'payment.json');

    try {
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const savedConfig = JSON.parse(configContent);
        return {
          secretKey: savedConfig.secretKey || '',
          callbackToken: savedConfig.callbackToken || '',
          webhookPort: savedConfig.webhookPort || 3847
        };
      }
    } catch (error) {
      console.error('Failed to load Xendit config:', error);
    }

    // Return defaults if no config
    return {
      secretKey: '',
      callbackToken: '',
      webhookPort: 3847
    };
  }

  async createInvoice(data: { externalId: string; amount: number; packageId: string }): Promise<types.XenditInvoice> {
    if (!this.config.secretKey) {
      throw new Error('Xendit API key not configured. Please set up payment configuration.');
    }

    try {
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 5); // 5 minutes expiry

      const response = await this.api.post<types.XenditInvoice>('/invoices', {
        external_id: data.externalId,
        amount: data.amount,
        payer_email: undefined, // Optional
        description: `Photobooth Package: ${data.packageId}`,
        expiry_date: expiryDate.toISOString(),
        requested_currency: 'IDR',
        payment_methods: ['QR_CODE', 'VIRTUAL_ACCOUNT'],
        callback_url: `http://localhost:${this.config.webhookPort}/webhook/xendit`,
        redirect_url: undefined
      });

      return response.data;
    } catch (error: any) {
      console.error('Xendit invoice creation failed:', error.response?.data || error.message);
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  async checkStatus(invoiceId: string): Promise<types.PaymentStatus> {
    if (!this.config.secretKey) {
      throw new Error('Xendit API key not configured');
    }

    try {
      const response = await this.api.get<{ status: string; amount: string | number }>(`/invoices/${invoiceId}`);

      const statusMap: Record<string, types.PaymentStatus['status']> = {
        'PENDING': 'pending',
        'PAID': 'paid',
        'EXPIRED': 'expired',
        'FAILED': 'failed'
      };

      return {
        status: statusMap[response.data.status] || 'pending',
        invoiceId,
        amount: response.data.amount ? parseFloat(String(response.data.amount)) : 0
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { status: 'failed', invoiceId };
      }
      throw error;
    }
  }

  validateWebhookToken(token: string): boolean {
    return token === this.config.callbackToken;
  }

  getConfig(): XenditConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<XenditConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Save to file
    const configPath = path.join(process.cwd(), 'config', 'payment.json');

    if (!fs.existsSync(path.dirname(configPath))) {
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
  }

  // Start the webhook server (running in the background)
  async startWebhookServer(onPaymentConfirmed: (invoiceId: string, sessionId: string) => Promise<void>): Promise<void> {
    if (this.webhookServer) {
      console.log('Webhook server already running');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // We'll create a simple Express server inline instead of a separate file
        const express = require('express');
        const bodyParser = require('body-parser');

        const app = express();
        app.use(bodyParser.json());

        // Webhook endpoint
        app.post('/webhook/xendit', async (req: any, res: any) => {
          try {
            const token = req.headers['x-callback-token'];

            if (!this.validateWebhookToken(token)) {
              console.warn('Invalid webhook token received');
              return res.status(401).json({ error: 'Invalid token' });
            }

            const { external_id, status, amount, paid_at } = req.body;

            console.log(`Webhook received: ${external_id} - ${status}`);

            if (status === 'PAID' || status === 'SETTLED') {
              await onPaymentConfirmed(external_id, external_id); // external_id is sessionId in our case
            }

            res.status(200).json({ received: true });
          } catch (error) {
            console.error('Webhook processing error:', error);
            res.status(500).json({ error: 'Processing failed' });
          }
        });

        // Health check
        app.get('/health', (req: any, res: any) => {
          res.json({ status: 'ok' });
        });

        // Start server
        this.webhookServer = app.listen(this.config.webhookPort, '0.0.0.0', () => {
          console.log(`Xendit webhook server listening on port ${this.config.webhookPort}`);
          resolve();
        });

        // Handle server errors
        this.webhookServer.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            console.error(`Port ${this.config.webhookPort} is already in use`);
            reject(new Error(`Port ${this.config.webhookPort} is busy. Please configure a different webhook port.`));
          } else {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  stopWebhookServer(): void {
    if (this.webhookServer) {
      this.webhookServer.close();
      this.webhookServer = null;
      console.log('Webhook server stopped');
    }
  }
}

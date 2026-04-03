// @ts-nocheck
import printer from 'node-printer';
import { createCanvas } from 'canvas';
import * as types from '../../shared/types';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export class PrinterService {
  private queue: types.PrintJob[] = [];
  private isProcessing: boolean = false;

  constructor() {
    // Initialize printer module
    printer.getPrinters((err, printers) => {
      if (err) {
        console.error('Failed to get printers:', err);
      } else {
        console.log(`Found ${printers.length} printers`);
      }
    });
  }

  async listPrinters(): Promise<types.PrinterInfo[]> {
    return new Promise((resolve, reject) => {
      printer.getPrinters((err, printers: any[]) => {
        if (err) {
          reject(new Error(`Failed to list printers: ${err}`));
          return;
        }

        const printerList: types.PrinterInfo[] = printers.map(p => ({
          name: p.name,
          isDefault: p.isDefault || false,
          isOnline: p.isOnline || false,
          status: this.mapPrinterStatus(p.status)
        }));

        resolve(printerList);
      });
    });
  }

  private mapPrinterStatus(status: string): types.PrinterInfo['status'] {
    const statusMap: Record<string, types.PrinterInfo['status']> = {
      'idle': 'idle',
      'printing': 'printing',
      'error': 'error',
      'offline': 'error'
    };
    return statusMap[status.toLowerCase()] || 'idle';
  }

  async printPhoto(filePath: string, options: types.PrintOptions): Promise<void> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Create print job and add to queue
    const job: types.PrintJob = {
      id: `print-${Date.now()}`,
      printerName: options.printerName,
      filePath,
      status: 'pending',
      createdAt: new Date().toISOString(),
      copies: options.copies,
      paperSize: options.paperSize,
      quality: options.quality,
      colorMode: options.colorMode
    };

    this.queue.push(job);
    this.processQueue();

    // Wait for job completion
    await this.waitForJob(job.id);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue[0];

      try {
        // Update job status
        job.status = 'printing';

        await this.executePrint(job);

        job.status = 'completed';
        job.printedAt = new Date().toISOString();

        console.log(`Print job ${job.id} completed on ${job.printerName}`);
      } catch (error) {
        job.status = 'failed';
        job.errorMessage = error instanceof Error ? error.message : String(error);

        console.error(`Print job ${job.id} failed:`, error);
      }

      // Remove completed/failed job from queue
      this.queue.shift();
    }

    this.isProcessing = false;
  }

  private async executePrint(job: types.PrintJob): Promise<void> {
    return new Promise((resolve, reject) => {
      const printOptions = this.mapPrintOptions(job);

      printer.printFile({
        printer: job.printerName,
        file: job.filePath,
        success: (jobId: string) => {
          console.log(`Print success: ${jobId}`);
          resolve();
        },
        error: (err: Error) => {
          console.error(`Print error:`, err);
          reject(err);
        }
      }, printOptions);
    });
  }

  private mapPrintOptions(job: types.PrintJob): any {
    const options: any = {};

    // Paper size mapping
    const paperSizes: Record<string, { width: number; height: number }> = {
      '4x6': { width: 4, height: 6 }, // inches
      '2x6': { width: 2, height: 6 },
      '5x7': { width: 5, height: 7 },
      'A4': { width: 8.27, height: 11.69 }
    };

    if (paperSizes[job.paperSize]) {
      options.paperSize = paperSizes[job.paperSize];
    }

    // Quality mapping
    const qualityDpi: Record<string, number> = {
      'draft': 150,
      'normal': 300,
      'high': 600
    };

    if (qualityDpi[job.quality]) {
      options.dpi = qualityDpi[job.quality];
    }

    // Color mode
    options.color = job.colorMode === 'color';

    // Copies
    options.copies = job.copies;

    return options;
  }

  async getQueue(): Promise<types.PrintJob[]> {
    return [...this.queue];
  }

  async cancelJob(jobId: string): Promise<void> {
    const index = this.queue.findIndex(j => j.id === jobId);
    if (index !== -1) {
      this.queue.splice(index, 1);
    } else {
      throw new Error(`Print job ${jobId} not found in queue`);
    }
  }

  async waitForJob(jobId: string, timeout = 30000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkInterval = setInterval(() => {
        const job = this.queue.find(j => j.id === jobId);

        if (!job) {
          clearInterval(checkInterval);
          resolve(); // Job already completed and removed
          return;
        }

        if (job.status === 'completed') {
          clearInterval(checkInterval);
          resolve();
        } else if (job.status === 'failed') {
          clearInterval(checkInterval);
          reject(new Error(job.errorMessage || 'Print job failed'));
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error('Print job timeout'));
        }
      }, 1000);
    });
  }

  // Utility to get default printer
  async getDefaultPrinter(): Promise<string | null> {
    const printers = await this.listPrinters();
    const defaultPrinter = printers.find(p => p.isDefault);
    return defaultPrinter?.name || null;
  }

  // Test print (print a test page)
  async testPrint(printerName?: string): Promise<void> {
    const printers = await this.listPrinters();

    if (printers.length === 0) {
      throw new Error('No printers found on the system');
    }

    const targetPrinter = printerName || (await this.getDefaultPrinter());

    if (!targetPrinter) {
      throw new Error('No default printer configured');
    }

    // Create a simple test image
    const canvas = createCanvas(400, 300);
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 300);

    // Text
    ctx.font = '24px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText('Maja Photobooth Test', 200, 150);
    ctx.font = '16px Arial';
    ctx.fillText(new Date().toLocaleString(), 200, 180);

    const testImagePath = path.join(app.getPath('temp'), 'photobooth-test.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(testImagePath, buffer);

    try {
      await this.printPhoto(testImagePath, {
        printerName: targetPrinter,
        copies: 1,
        paperSize: '4x6',
        quality: 'normal',
        colorMode: 'color'
      });
    } finally {
      // Cleanup test file
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    }
  }
}

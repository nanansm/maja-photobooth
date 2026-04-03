// Shared types used across main and renderer processes

export interface Camera {
  id: string;
  model: string;
  port: string;
  isConnected: boolean;
}

export interface CaptureOptions {
  sessionId: string;
  photoNumber: number;
  quality?: 'low' | 'medium' | 'high';
}

export interface PaymentStatus {
  status: 'pending' | 'paid' | 'expired' | 'failed';
  invoiceId?: string;
  paidAt?: string;
  amount?: number;
  paymentMethod?: string;
}

export interface SendPhotoOptions {
  to: string | string[];
  customerName?: string;
  sessionId: string;
  processedPhotoPath: string;
  stripPaths?: string[];
  downloadUrl?: string;
  eventName?: string;
  boothName?: string;
}

export interface XenditInvoice {
  id: string;
  externalId: string;
  status: string;
  amount: number;
  payerEmail?: string;
  expiryDate: string;
  qrCode: string;
  virtualAccount?: {
    bankCode: string;
  };
}

export interface Package {
  id: string;
  name: string;
  price: number;
  photoCount: number;
  printCount: number;
  digitalCopy: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface Session {
  id: string;
  createdAt: string;
  packageId: string;
  paymentStatus: 'pending' | 'paid' | 'expired';
  paymentMethod?: string;
  xenditInvoiceId?: string;
  amount: number;
  photoCount: number;
  printCount: number;
  completedAt?: string;
}

export interface Photo {
  id: string;
  sessionId: string;
  filePath: string;
  processedPath?: string;
  createdAt: string;
}

export interface StripLayout {
  type: 'strip' | 'collage' | 'grid';
  columns: number;
  rows: number;
  photoWidth: number;
  photoHeight: number;
  spacing: number;
  orientation: 'portrait' | 'landscape';
}

export interface CollageTemplate {
  id: string;
  name: string;
  type: string;
  config: StripLayout;
  previewImage?: string;
}

export interface FrameTemplate {
  id: string;
  name: string;
  previewImage: string;
  overlayImage: string;
  photoSlots: PhotoSlot[];
  canvasWidth: number;
  canvasHeight: number;
  isActive: boolean;
}

export interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface TextOverlayConfig {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation?: number;
}

export interface PrintOptions {
  printerName: string;
  copies: number;
  paperSize: '4x6' | '2x6' | '5x7' | 'A4';
  quality: 'draft' | 'normal' | 'high';
  colorMode: 'color' | 'grayscale';
}

export interface PrinterInfo {
  name: string;
  isDefault: boolean;
  isOnline: boolean;
  status: 'idle' | 'printing' | 'error';
}

export interface PrintJob {
  id: string;
  printerName: string;
  filePath: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  createdAt: string;
  copies: number;
}

export interface AppConfig {
  adminPassword: string;
  xenditSecretKey: string;
  xenditCallbackToken: string;
  webhookPort: number;
  defaultPrinter: string;
  defaultCamera: string;
  logoPath: string;
  themeColor: string;
  idleText: string;
  backgroundMusic: string;
  demoMode: boolean;

  // Email configuration
  smtp: {
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
  };

  // Cloud storage
  cloudStorage: {
    provider: 'none' | 'cloudinary' | 's3' | 'google-drive';
    cloudName?: string;
    apiKey?: string;
    apiSecret?: string;
    bucket?: string;
    region?: string;
  };
}

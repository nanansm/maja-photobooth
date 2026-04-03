import { contextBridge, ipcRenderer } from 'electron';
import * as types from './shared/types';

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Camera
  camera: {
    detect: (): Promise<types.Camera[]> =>
      ipcRenderer.invoke('camera:detect'),
    setActive: (cameraId: string): Promise<void> =>
      ipcRenderer.invoke('camera:set-active', cameraId),
    capture: (options: types.CaptureOptions): Promise<string> =>
      ipcRenderer.invoke('camera:capture', options),
    startPreview: (): Promise<void> =>
      ipcRenderer.invoke('camera:preview:start'),
    stopPreview: (): Promise<void> =>
      ipcRenderer.invoke('camera:preview:stop'),
    onPreviewFrame: (callback: (frame: string) => void): void => {
      ipcRenderer.on('camera:preview:frame', (_, frame: string) => callback(frame));
    },
    removePreviewListener: (): void => {
      ipcRenderer.removeAllListeners('camera:preview:frame');
    }
  },

  // Payment
  payment: {
    createInvoice: (externalId: string, amount: number, packageId: string) =>
      ipcRenderer.invoke('payment:create-invoice', { externalId, amount, packageId }),
    checkStatus: (invoiceId: string): Promise<types.PaymentStatus> =>
      ipcRenderer.invoke('payment:check-status', invoiceId),
    onConfirmed: (callback: (data: types.Session) => void): void => {
      ipcRenderer.on('payment:confirmed', (_, session: types.Session) => callback(session));
    },
    removeConfirmedListener: (): void => {
      ipcRenderer.removeAllListeners('payment:confirmed');
    }
  },

  // Photo
  photo: {
    createStrip: (photos: string[], layout: types.StripLayout): Promise<string> =>
      ipcRenderer.invoke('photo:create-strip', { photos, layout }),
    applyFrame: (photoPath: string, frameTemplate: types.FrameTemplate): Promise<string> =>
      ipcRenderer.invoke('photo:apply-frame', { photoPath, frameTemplate }),
    applyFilter: (photoPath: string, filter: string, intensity?: number): Promise<string> =>
      ipcRenderer.invoke('photo:apply-filter', { photoPath, filter, intensity }),
    createCollage: (photos: string[], template: types.CollageTemplate): Promise<string> =>
      ipcRenderer.invoke('photo:create-collage', { photos, template }),
    addTextOverlay: (photoPath: string, config: types.TextOverlayConfig): Promise<string> =>
      ipcRenderer.invoke('photo:add-text', { photoPath, config })
  },

  // Printer
  printer: {
    list: (): Promise<types.PrinterInfo[]> =>
      ipcRenderer.invoke('printer:list'),
    print: (filePath: string, options: types.PrintOptions): Promise<void> =>
      ipcRenderer.invoke('printer:print', { filePath, options }),
    getQueue: (): Promise<types.PrintJob[]> =>
      ipcRenderer.invoke('printer:queue'),
    cancelJob: (jobId: string): Promise<void> =>
      ipcRenderer.invoke('printer:cancel', jobId)
  },

  // Email
  email: {
    send: (options: types.SendPhotoOptions): Promise<void> =>
      ipcRenderer.invoke('email:send', options),
    test: (): Promise<boolean> =>
      ipcRenderer.invoke('email:test'),
    previewTemplate: (sessionData: types.SendPhotoOptions): Promise<string> =>
      ipcRenderer.invoke('email:preview-template', sessionData),
    getConfig: (): Promise<any> =>
      ipcRenderer.invoke('email:get-config'),
    saveConfig: (config: any): Promise<void> =>
      ipcRenderer.invoke('email:save-config', config)
  },

  // Database / Config
  db: {
    getPackages: (): Promise<types.Package[]> =>
      ipcRenderer.invoke('db:get-packages'),
    getActivePackage: (): Promise<types.Package | null> =>
      ipcRenderer.invoke('db:get-active-package'),
    savePackage: (pkg: types.Package): Promise<void> =>
      ipcRenderer.invoke('db:save-package', pkg),
    deletePackage: (id: string): Promise<void> =>
      ipcRenderer.invoke('db:delete-package', id),

    getFrames: (): Promise<types.FrameTemplate[]> =>
      ipcRenderer.invoke('db:get-frames'),
    saveFrame: (frame: types.FrameTemplate): Promise<void> =>
      ipcRenderer.invoke('db:save-frame', frame),
    deleteFrame: (id: string): Promise<void> =>
      ipcRenderer.invoke('db:delete-frame', id),

    getConfig: (): Promise<types.AppConfig> =>
      ipcRenderer.invoke('config:get'),
    saveConfig: (config: Partial<types.AppConfig>): Promise<void> =>
      ipcRenderer.invoke('config:save', config),

    getSessions: (limit?: number): Promise<types.Session[]> =>
      ipcRenderer.invoke('db:get-sessions', limit),
    getSessionStats: (date?: string): Promise<{ total: number; revenue: number; prints: number }> =>
      ipcRenderer.invoke('db:get-stats', date)
  },

  // System
  system: {
    getAppVersion: (): Promise<string> =>
      ipcRenderer.invoke('system:version'),
    getPlatform: (): Promise<NodeJS.Platform> =>
      ipcRenderer.invoke('system:platform')
  }
});

// Type declaration for the exposed API
declare global {
  interface Window {
    electronAPI: {
      camera: {
        detect: () => Promise<types.Camera[]>;
        setActive: (cameraId: string) => Promise<void>;
        capture: (options: types.CaptureOptions) => Promise<string>;
        startPreview: () => Promise<void>;
        stopPreview: () => Promise<void>;
        onPreviewFrame: (callback: (frame: string) => void) => void;
        removePreviewListener: () => void;
      };
      payment: {
        createInvoice: (externalId: string, amount: number, packageId: string) => Promise<any>;
        checkStatus: (invoiceId: string) => Promise<types.PaymentStatus>;
        onConfirmed: (callback: (data: types.Session) => void) => void;
        removeConfirmedListener: () => void;
      };
      photo: {
        createStrip: (photos: string[], layout: types.StripLayout) => Promise<string>;
        applyFrame: (photoPath: string, frameTemplate: types.FrameTemplate) => Promise<string>;
        applyFilter: (photoPath: string, filter: string, intensity?: number) => Promise<string>;
        createCollage: (photos: string[], template: types.CollageTemplate) => Promise<string>;
        addTextOverlay: (photoPath: string, config: types.TextOverlayConfig) => Promise<string>;
      };
      printer: {
        list: () => Promise<types.PrinterInfo[]>;
        print: (filePath: string, options: types.PrintOptions) => Promise<void>;
        getQueue: () => Promise<types.PrintJob[]>;
        cancelJob: (jobId: string) => Promise<void>;
      };
      db: {
        getPackages: () => Promise<types.Package[]>;
        getActivePackage: () => Promise<types.Package | null>;
        savePackage: (pkg: types.Package) => Promise<void>;
        deletePackage: (id: string) => Promise<void>;
        getFrames: () => Promise<types.FrameTemplate[]>;
        saveFrame: (frame: types.FrameTemplate) => Promise<void>;
        deleteFrame: (id: string) => Promise<void>;
        getConfig: () => Promise<types.AppConfig>;
        saveConfig: (config: Partial<types.AppConfig>) => Promise<void>;
        getSessions: (limit?: number) => Promise<types.Session[]>;
        getSessionStats: (date?: string) => Promise<{ total: number; revenue: number; prints: number }>;
      };
      system: {
        getAppVersion: () => Promise<string>;
        getPlatform: () => Promise<NodeJS.Platform>;
      };
      email: {
        send: (options: any) => Promise<void>;
        test: () => Promise<boolean>;
        previewTemplate: (sessionData: any) => Promise<string>;
        getConfig: () => Promise<any>;
        saveConfig: (config: any) => Promise<void>;
      };
    };
  }
}

import { create } from 'zustand';
import * as types from '../../shared/types';

interface KioskState {
  currentScreen: 'idle' | 'package-select' | 'payment' | 'capture' | 'preview' | 'processing' | 'print' | 'email' | 'share' | 'complete';
  currentPackage: types.Package | null;
  sessionId: string | null;
  photos: string[];
  currentPhotoIndex: number;
  selectedFrame: types.FrameTemplate | null;
  processedPhoto: string | null;
  paymentStatus: 'pending' | 'paid' | 'expired' | 'failed';
  isCapturing: boolean;
  countdown: number;
  error: string | null;

  // Email
  customerEmail: string;
  emailSending: boolean;
  emailSent: boolean;
  emailError: string | null;
}

interface AdminState {
  isAuthenticated: boolean;
  activeTab: 'dashboard' | 'packages' | 'frames' | 'settings' | 'history' | 'camera' | 'printer' | 'email' | 'notifications' | 'storage';
}

interface EmailStats {
  totalSent: number;
  failed: number;
  lastSent?: string;
}

interface AppState {
  // Kiosk state
  kiosk: KioskState;
  setScreen: (screen: KioskState['currentScreen']) => void;
  setCurrentPackage: (pkg: types.Package | null) => void;
  setSessionId: (id: string | null) => void;
  addPhoto: (photoPath: string) => void;
  clearPhotos: () => void;
  setCurrentPhotoIndex: (index: number) => void;
  setSelectedFrame: (frame: types.FrameTemplate | null) => void;
  setProcessedPhoto: (path: string | null) => void;
  setPaymentStatus: (status: KioskState['paymentStatus']) => void;
  setCapturing: (capturing: boolean) => void;
  setCountdown: (count: number) => void;
  setError: (error: string | null) => void;
  setCustomerEmail: (email: string) => void;
  setEmailSending: (sending: boolean) => void;
  setEmailSent: (sent: boolean) => void;
  setEmailError: (error: string | null) => void;
  resetKiosk: () => void;

  // Admin state (expanded tabs)
  admin: AdminState;
  authenticate: (password: string) => Promise<boolean>;
  logout: () => void;
  setAdminTab: (tab: AdminState['activeTab']) => void;

  // App config
  config: types.AppConfig;
  loadConfig: () => Promise<void>;
  updateConfig: (config: Partial<types.AppConfig>) => Promise<void>;

  // Data
  packages: types.Package[];
  frames: types.FrameTemplate[];
  sessions: types.Session[];
  stats: { total: number; revenue: number; prints: number } | null;
  loadPackages: () => Promise<void>;
  loadFrames: () => Promise<void>;
  loadSessions: () => Promise<void>;
  loadStats: () => Promise<void>;

  // Email
  sendEmail: () => Promise<boolean>;
  testEmailConnection: () => Promise<boolean>;

  // Notifications
  notifications: any[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Cloud storage
  uploadToCloud: (filePath: string) => Promise<string>;
}

const defaultKioskState: KioskState = {
  currentScreen: 'idle',
  currentPackage: null,
  sessionId: null,
  photos: [],
  currentPhotoIndex: 0,
  selectedFrame: null,
  processedPhoto: null,
  paymentStatus: 'pending',
  isCapturing: false,
  countdown: 0,
  error: null,
  customerEmail: '',
  emailSending: false,
  emailSent: false,
  emailError: null
};

const defaultAdminState: AdminState = {
  isAuthenticated: false,
  activeTab: 'dashboard'
};

export const useStore = create<AppState>((set, get) => ({
  // Kiosk state
  kiosk: { ...defaultKioskState },
  setScreen: (screen) => set(state => ({
    kiosk: { ...state.kiosk, currentScreen: screen }
  })),
  setCurrentPackage: (pkg) => set(state => ({
    kiosk: { ...state.kiosk, currentPackage: pkg }
  })),
  setSessionId: (id) => set(state => ({
    kiosk: { ...state.kiosk, sessionId: id }
  })),
  addPhoto: (photoPath) => set(state => ({
    kiosk: {
      ...state.kiosk,
      photos: [...state.kiosk.photos, photoPath]
    }
  })),
  clearPhotos: () => set(state => ({
    kiosk: { ...state.kiosk, photos: [] }
  })),
  setCurrentPhotoIndex: (index) => set(state => ({
    kiosk: { ...state.kiosk, currentPhotoIndex: index }
  })),
  setSelectedFrame: (frame) => set(state => ({
    kiosk: { ...state.kiosk, selectedFrame: frame }
  })),
  setProcessedPhoto: (path) => set(state => ({
    kiosk: { ...state.kiosk, processedPhoto: path }
  })),
  setPaymentStatus: (status) => set(state => ({
    kiosk: { ...state.kiosk, paymentStatus: status }
  })),
  setCapturing: (capturing) => set(state => ({
    kiosk: { ...state.kiosk, isCapturing: capturing }
  })),
  setCountdown: (count) => set(state => ({
    kiosk: { ...state.kiosk, countdown: count }
  })),
  setError: (error) => set(state => ({
    kiosk: { ...state.kiosk, error }
  })),
  resetKiosk: () => set(state => ({
    kiosk: { ...defaultKioskState }
  })),

  // Admin state
  admin: { ...defaultAdminState },
  authenticate: async (password) => {
    try {
      const config = await window.electronAPI.db.getConfig();
      const isValid = password === config.adminPassword;
      if (isValid) {
        set(state => ({ admin: { ...state.admin, isAuthenticated: true } }));
      }
      return isValid;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  },
  logout: () => set(state => ({
    admin: { ...defaultAdminState, activeTab: state.admin.activeTab }
  })),
  setAdminTab: (tab) => set(state => ({
    admin: { ...state.admin, activeTab: tab }
  })),

  // App config
  config: {
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
    demoMode: false,
    smtp: {
      provider: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: '', pass: '' },
      fromName: 'Photobooth Kami',
      fromEmail: 'noreply@photobooth.id'
    },
    cloudStorage: {
      provider: 'none'
    }
  },
  loadConfig: async () => {
    try {
      const config = await window.electronAPI.db.getConfig();
      set({ config });
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  },
  updateConfig: async (newConfig) => {
    try {
      await window.electronAPI.db.saveConfig(newConfig);
      set(state => ({ config: { ...state.config, ...newConfig } }));
    } catch (error) {
      console.error('Failed to update config:', error);
      throw error;
    }
  },

  // Data
  packages: [],
  frames: [],
  sessions: [],
  stats: null,
  loadPackages: async () => {
    try {
      const packages = await window.electronAPI.db.getPackages();
      set({ packages });
    } catch (error) {
      console.error('Failed to load packages:', error);
    }
  },
  loadFrames: async () => {
    try {
      const frames = await window.electronAPI.db.getFrames();
      set({ frames });
    } catch (error) {
      console.error('Failed to load frames:', error);
    }
  },
  loadSessions: async (limit?: number) => {
    try {
      const sessions = await window.electronAPI.db.getSessions(limit);
      set({ sessions });
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  },
  loadStats: async (date?: string) => {
    try {
      const stats = await window.electronAPI.db.getSessionStats(date);
      set({ stats });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  },

  // Email actions
  setCustomerEmail: (email: string) => set(state => ({
    kiosk: { ...state.kiosk, customerEmail: email, emailError: null }
  })),
  setEmailSending: (sending: boolean) => set(state => ({
    kiosk: { ...state.kiosk, emailSending: sending }
  })),
  setEmailSent: (sent: boolean) => set(state => ({
    kiosk: { ...state.kiosk, emailSent: sent }
  })),
  setEmailError: (error: string | null) => set(state => ({
    kiosk: { ...state.kiosk, emailError: error }
  })),

  sendEmail: async () => {
    const { kiosk, config, currentPackage } = get();

    if (!kiosk.processedPhoto) {
      throw new Error('No photo to send');
    }

    if (!kiosk.customerEmail) {
      setEmailError('Email address required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(kiosk.customerEmail)) {
      setEmailError('Invalid email format');
      return false;
    }

    setEmailSending(true);
    setEmailError(null);

    try {
      await window.electronAPI.email.send({
        to: kiosk.customerEmail,
        customerName: kiosk.customerEmail.split('@')[0],
        sessionId: kiosk.sessionId || 'unknown',
        processedPhotoPath: kiosk.processedPhoto,
        eventName: currentPackage?.name || 'Photobooth Session',
        boothName: 'Maja Photobooth'
      });

      setEmailSent(true);
      setEmailSending(false);
      return true;
    } catch (error: any) {
      setEmailError(error.message || 'Failed to send email');
      setEmailSending(false);
      return false;
    }
  },

  testEmailConnection: async () => {
    try {
      await window.electronAPI.email.test();
      return true;
    } catch (error) {
      console.error('Email test failed:', error);
      return false;
    }
  },

  // Notifications
  notifications: [],
  markNotificationRead: (id: string) => set(state => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
  })),
  clearNotifications: () => set({ notifications: [] }),

  // Cloud storage (optional)
  uploadToCloud: async (filePath: string) => {
    // This would integrate with Cloudinary, S3, etc.
    // For now, return a local URL
    const url = `file://${filePath}`;
    return url;
  }
}));

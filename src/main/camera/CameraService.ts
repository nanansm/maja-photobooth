import { ChildProcess, spawn } from 'child_process';
import * as types from '../../shared/types';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

// Sample Canon cameras that work with gphoto2
const KNOWN_CANON_MODELS = [
  'Canon EOS R100',
  'Canon EOS R50',
  'Canon EOS R10',
  'Canon EOS R5',
  'Canon EOS R6',
  'Canon EOS R7',
  'Canon EOS M50',
  'Canon EOS 1300D',
  'Canon EOS 600D',
  'Canon EOS 700D',
  'Canon EOS 800D',
  'Canon EOS 250D',
  'Canon EOS 2000D',
  'Canon EOS 4000D'
];

// Webcam fallback using MediaDevices API
class WebcamFallback {
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1920, height: 1080 },
        audio: false
      });
    } catch (error) {
      throw new Error(`Failed to access webcam: ${error}`);
    }
  }

  capture(frameNumber: number, sessionId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.stream) {
        reject(new Error('Webcam not started'));
        return;
      }

      // In renderer, this would use a canvas to capture from the stream
      // This is a simplified version - actual implementation needs renderer coordination
      reject(new Error('Webcam capture must be implemented in renderer process'));
    });
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  getStream(): MediaStream | null {
    return this.stream;
  }
}

export class CameraService {
  private activeCamera: types.Camera | null = null;
  private gphoto2Process: ChildProcess | null = null;
  private isPreviewRunning: boolean = false;
  private webcamFallback: WebcamFallback | null = null;
  private previewCallback: ((frame: string) => void) | null = null;
  private sessionsDir: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.sessionsDir = path.join(userDataPath, 'sessions');
  }

  async detectCameras(): Promise<types.Camera[]> {
    const cameras: types.Camera[] = [];

    try {
      // Try gphoto2 detection
      const gphoto2Result = await this.execGPhoto2(['--auto-detect', '--summary']);

      if (gphoto2Result) {
        const lines = gphoto2Result.split('\n');
        let isModelLine = false;

        for (const line of lines) {
          if (line.includes('Model')) {
            isModelLine = true;
            continue;
          }

          if (isModelLine && line.trim() && !line.includes('-----')) {
            const model = line.trim();
            // Check if it's a known Canon model or any camera
            if (KNOWN_CANON_MODELS.some(canon => model.includes(canon)) || model.includes('Canon')) {
              cameras.push({
                id: `canon-${model.replace(/\s+/g, '-').toLowerCase()}`,
                model,
                port: 'usb',
                isConnected: true
              });
            }
            isModelLine = false;
          }
        }
      }
    } catch (error) {
      console.log('gphoto2 detection failed or not available:', error);
    }

    // If no gphoto2 cameras found, try webcam via MediaDevices
    if (cameras.length === 0) {
      try {
        // Check if webcam is available via simple test stream
        const testStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });

        // Stop immediately after test
        testStream.getTracks().forEach(track => track.stop());

        cameras.push({
          id: 'webcam-0',
          model: 'Webcam (Fallback)',
          port: 'usb',
          isConnected: true
        });
      } catch (webcamError) {
        console.log('Webcam not available:', webcamError);
      }
    }

    return cameras;
  }

  async setActiveCamera(cameraId: string): Promise<void> {
    const cameras = await this.detectCameras();
    const camera = cameras.find(c => c.id === cameraId);

    if (!camera) {
      throw new Error(`Camera ${cameraId} not found`);
    }

    this.activeCamera = camera;

    // Test connection
    if (cameraId.startsWith('canon-')) {
      try {
        await this.execGPhoto2(['--summary']);
      } catch (error) {
        throw new Error(`Failed to connect to ${camera.model}: ${error}`);
      }
    } else if (cameraId.startsWith('webcam-')) {
      try {
        this.webcamFallback = new WebcamFallback();
        await this.webcamFallback.start();
      } catch (error) {
        throw new Error(`Failed to start webcam: ${error}`);
      }
    }
  }

  async capturePhoto(options: types.CaptureOptions): Promise<string> {
    if (!this.activeCamera) {
      throw new Error('No camera selected. Call setActiveCamera first.');
    }

    const { sessionId, photoNumber, quality = 'high' } = options;

    // Ensure session directory exists
    const sessionDir = path.join(this.sessionsDir, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const filename = `photo-${String(photoNumber).padStart(3, '0')}.jpg`;
    const filepath = path.join(sessionDir, filename);

    try {
      if (this.activeCamera.id.startsWith('canon-')) {
        await this.captureCanon(filepath, quality);
      } else if (this.activeCamera.id.startsWith('webcam-')) {
        await this.captureWebcam(filepath);
      } else {
        throw new Error(`Unsupported camera type: ${this.activeCamera.id}`);
      }

      if (!fs.existsSync(filepath)) {
        throw new Error('Photo capture failed: file not created');
      }

      return filepath;
    } catch (error) {
      console.error('Capture failed:', error);
      throw error;
    }
  }

  private async captureCanon(outputPath: string, quality: 'low' | 'medium' | 'high'): Promise<void> {
    const qualityMap: Record<string, string> = {
      low: '-q 2',
      medium: '-q 4',
      high: '-q 6'
    };

    const args = [
      '--capture-image-and-download',
      ...qualityMap[quality].split(' '),
      `--filename=${outputPath}`
    ];

    try {
      await this.execGPhoto2(args);
    } catch (error) {
      throw new Error(`Canon camera capture failed: ${error}`);
    }
  }

  private async captureWebcam(outputPath: string): Promise<void> {
    if (!this.webcamFallback) {
      throw new Error('Webcam fallback not initialized');
    }

    // This needs to be called from the renderer process where MediaDevices is available
    // We'll need to use IPC to the renderer to capture from the webcam stream
    throw new Error('Webcam capture must be implemented via renderer IPC. Use renderer process to capture from canvas.');
  }

  async startLivePreview(callback: (frame: string) => void): Promise<void> {
    if (!this.activeCamera) {
      throw new Error('No camera selected');
    }

    this.previewCallback = callback;
    this.isPreviewRunning = true;

    if (this.activeCamera.id.startsWith('canon-')) {
      await this.startCanonPreview();
    } else if (this.activeCamera.id.startsWith('webcam-')) {
      await this.startWebcamPreview();
    }
  }

  async startCanonPreview(): Promise<void> {
    if (this.gphoto2Process) {
      this.gphoto2Process.kill();
    }

    // gphoto2 can stream movie/video from camera
    this.gphoto2Process = spawn('gphoto2', [
      '--capture-movie',
      '--stdout'
    ]);

    if (this.gphoto2Process.stdout) {
      // For demo, we'll just log that preview started
      // Actual MJPEG stream processing would require parsing the stream
      console.log('Canon preview started (simplified - full MJPEG streaming needs additional implementation)');
    }
  }

  async startWebcamPreview(): Promise<void> {
    if (!this.webcamFallback) {
      this.webcamFallback = new WebcamFallback();
    }
    await this.webcamFallback.start();

    // The actual frame delivery to renderer happens in renderer process
    console.log('Webcam preview started (frames delivered via renderer canvas)');
  }

  stopLivePreview(): void {
    this.isPreviewRunning = false;

    if (this.gphoto2Process) {
      this.gphoto2Process.kill();
      this.gphoto2Process = null;
    }

    if (this.webcamFallback) {
      this.webcamFallback.stop();
      this.webcamFallback = null;
    }

    this.previewCallback = null;
  }

  private execGPhoto2(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const gphoto2 = spawn('gphoto2', args);

      let stdout = '';
      let stderr = '';

      gphoto2.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      gphoto2.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      gphoto2.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`gphoto2 exited with code ${code}: ${stderr}`));
        }
      });

      gphoto2.on('error', (error) => {
        reject(new Error(`Failed to execute gphoto2: ${error.message}`));
      });
    });
  }
}

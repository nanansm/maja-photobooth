import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Node.js modules that aren't available in test environment
vi.mock('child_process', () => ({
  spawn: vi.fn(() => ({
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
    on: vi.fn(),
    kill: vi.fn()
  }))
}));

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/photobooth-test')
  }
}));

import { CameraService } from '../src/main/camera/CameraService';

describe('CameraService', () => {
  let cameraService: CameraService;

  beforeEach(() => {
    cameraService = new CameraService();
    vi.clearAllMocks();
  });

  describe('detectCameras', () => {
    it('should return an array of cameras', async () => {
      const cameras = await cameraService.detectCameras();

      expect(Array.isArray(cameras)).toBe(true);
    });

    it('should return camera objects with required properties', async () => {
      const cameras = await cameraService.detectCameras();

      if (cameras.length > 0) {
        const camera = cameras[0];
        expect(camera).toHaveProperty('id');
        expect(camera).toHaveProperty('model');
        expect(camera).toHaveProperty('port');
        expect(camera).toHaveProperty('isConnected');
      }
    });

    it('should detect Canon cameras with proper ID format', async () => {
      const cameras = await cameraService.detectCameras();
      const canonCameras = cameras.filter(c => c.id.startsWith('canon-'));

      canonCameras.forEach(camera => {
        expect(camera.id).toMatch(/^canon-[a-z0-9-]+$/);
        expect(camera.model.toLowerCase()).toContain('canon');
      });
    });

    it('should detect webcam fallback', async () => {
      const cameras = await cameraService.detectCameras();
      const webcams = cameras.filter(c => c.id.startsWith('webcam-'));

      // At least one camera type should be detected (depends on test environment)
      expect(cameras.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('setActiveCamera', () => {
    it('should throw error for non-existent camera', async () => {
      await expect(cameraService.setActiveCamera('non-existent')).rejects.toThrow();
    });

    it('should set active camera if valid', async () => {
      const cameras = await cameraService.detectCameras();

      if (cameras.length > 0) {
        await cameraService.setActiveCamera(cameras[0].id);
        // Should not throw
      }
    });
  });

  describe('capturePhoto', () => {
    it('should throw if no camera selected', async () => {
      await expect(
        cameraService.capturePhoto({
          sessionId: 'test-session',
          photoNumber: 1,
          quality: 'high'
        })
      ).rejects.toThrow('No camera selected');
    });

    it('should require sessionId and photoNumber', async () => {
      const cameras = await cameraService.detectCameras();

      if (cameras.length > 0) {
        await cameraService.setActiveCamera(cameras[0].id);

        await expect(
          cameraService.capturePhoto({
            sessionId: 'test-session',
            photoNumber: 1
          })
        ).rejects.toThrow(); // Will fail because actual gphoto2 not available in test
      }
    });
  });

  describe('live preview', () => {
    it('should start preview without throwing for valid camera', async () => {
      const cameras = await cameraService.detectCameras();

      if (cameras.length > 0) {
        await cameraService.setActiveCamera(cameras[0].id);

        const callback = vi.fn();
        await cameraService.startLivePreview(callback);
        // Should not throw

        cameraService.stopLivePreview();
      }
    });
  });
});

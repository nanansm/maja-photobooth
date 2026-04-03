import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';

const CaptureScreen: React.FC = () => {
  const { kiosk, currentPackage, addPhoto, setScreen, setCountdown, config } = useStore();
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [capturedCount, setCapturedCount] = useState(0);
  const livePreviewRef = useRef<HTMLImageElement>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [previewFrame, setPreviewFrame] = useState<string>('');

  const totalPhotos = currentPackage?.photoCount || 4;

  // Start live preview
  useEffect(() => {
    startLivePreview();

    return () => {
      stopLivePreview();
    };
  }, []);

  const startLivePreview = async () => {
    try {
      await window.electronAPI.camera.startPreview();

      // Listen for preview frames
      window.electronAPI.camera.onPreviewFrame((frame: string) => {
        setPreviewFrame(frame);
        if (livePreviewRef.current) {
          livePreviewRef.current.src = frame;
        }
      });
    } catch (error: any) {
      console.error('Failed to start preview:', error);
      alert(`Camera error: ${error.message}. Please check camera connection.`);
    }
  };

  const stopLivePreview = () => {
    window.electronAPI.camera.stopPreview();
    window.electronAPI.camera.removePreviewListener();
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);

    // Play countdown sound if available
    playSound('countdown');

    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);

      if (count > 0) {
        playSound('countdown');
      } else {
        // Countdown finished, capture!
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
        capturePhoto();
      }
    }, 1000);
  };

  const capturePhoto = async () => {
    setCountdown(0);

    try {
      const photoPath = await window.electronAPI.camera.capturePhoto({
        sessionId: kiosk.sessionId || `demo-${Date.now()}`,
        photoNumber: capturedCount + 1,
        quality: 'high'
      });

      addPhoto(photoPath);
      setCapturedCount(prev => prev + 1);

      // Play shutter sound
      playSound('shutter');

      // Flash effect
      const flash = document.createElement('div');
      flash.className = 'fixed inset-0 bg-white z-50 shutter-flash pointer-events-none';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 300);

      if (capturedCount + 1 >= totalPhotos) {
        // All photos captured
        setTimeout(() => {
          stopLivePreview();
          setScreen('preview');
        }, 1000);
      } else {
        // Reset for next photo
        setTimeout(() => {
          setCountdown(0);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Capture failed:', error);
      alert(`Failed to capture photo: ${error.message}`);
    }
  };

  const playSound = (soundType: 'countdown' | 'shutter') => {
    // In demo mode, use simple beep
    if (config.demoMode) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (soundType === 'countdown') {
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
      } else {
        oscillator.frequency.value = 1200;
        gainNode.gain.value = 0.2;
      }

      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 100);
    } else {
      // Play actual sound file if configured
      // This would require audio assets
    }
  };

  const handleManualCapture = () => {
    if (kiosk.isCapturing) return;

    setCapturing(true);
    startCountdown();
  };

  const [isCapturing, setIsCapturing] = useState(false);

  const setCapturing = (value: boolean) => setIsCapturing(value);

  // Extend useStore with setCapturing
  useEffect(() => {
    (useStore as any).getState().setCapturing = setCapturing;
  }, []);

  const remaining = totalPhotos - capturedCount;

  return (
    <div className="relative w-full h-full bg-black flex flex-col">
      {/* Live preview */}
      <div className="flex-1 relative">
        {previewFrame ? (
          <img
            ref={livePreviewRef}
            src={previewFrame}
            alt="Live preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-2xl text-gray-500">Starting camera...</div>
          </div>
        )}

        {/* Overlay UI */}
        <div className="absolute top-0 left-0 right-0 p-8 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex justify-between items-center">
            <div className="text-white text-2xl font-bold">
              Foto {capturedCount + 1} / {totalPhotos}
            </div>
            <div className="text-white text-xl">
              {remaining > 0 ? `${remaining} foto lagi` : 'Selesai!'}
            </div>
          </div>
        </div>

        {/* Countdown overlay */}
        {kiosk.countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-9xl font-bold text-white animate-pulse">
              {kiosk.countdown}
            </div>
          </div>
        )}

        {/* Capture button */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          <button
            onClick={handleManualCapture}
            disabled={isCapturing || remaining <= 0}
            className="w-24 h-24 rounded-full bg-white border-8 border-gray-800 cursor-pointer hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
          >
            <div className="w-full h-full rounded-full bg-transparent"></div>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="h-32 bg-black flex items-center justify-center">
        <p className="text-xl text-center text-gray-400 px-8">
          {remaining > 0
            ? 'Siapkan pose! Tekan tombol putih untuk mengambil foto.'
            : 'Semua foto selesai! Memproses...'}
        </p>
      </div>
    </div>
  );
};

// Re-export for use in Router
export { CaptureScreen as default };

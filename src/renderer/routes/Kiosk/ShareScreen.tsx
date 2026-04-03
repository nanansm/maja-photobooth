import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useStore } from '../../store/useStore';

const ShareScreen: React.FC = () => {
  const { kiosk, setScreen, config } = useStore();
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Generate download URL
    const sessionId = kiosk.sessionId || `demo-${Date.now()}`;
    const url = config.demoMode
      ? `https://demo.openphotobooth.app/download/${sessionId}`
      : `http://localhost:${config.webhookPort}/download/${sessionId}`;

    setDownloadUrl(url);

    QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }).then(setQrCodeDataUrl).catch(console.error);

    // Countdown to reset
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          useStore.getState().resetKiosk();
          setScreen('idle');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [kiosk.sessionId, config.demoMode, config.webhookPort, setScreen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleContinue = () => {
    useStore.getState().resetKiosk();
    setScreen('idle');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-black via-gray-900 to-black p-8">
      <div className="text-6xl mb-4">📱</div>

      <h1 className="text-4xl font-display font-bold mb-2 text-center">Ambil Foto Digital</h1>
      <p className="text-gray-400 text-center mb-8 max-w-md">
        Scan QR code untuk mendownload foto-mu ke smartphone
      </p>

      {/* Final photo preview */}
      {kiosk.processedPhoto && (
        <div className="mb-8">
          <img
            src={`file://${kiosk.processedPhoto}`}
            alt="Final photo"
            className="max-h-40 w-auto rounded-xl shadow-lg border-2 border-gray-700"
          />
        </div>
      )}

      {/* QR Code */}
      <div className="bg-white p-6 rounded-3xl shadow-2xl mb-4">
        {qrCodeDataUrl ? (
          <img src={qrCodeDataUrl} alt="Download QR" className="w-64 h-64" />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center text-gray-400">
            Generating QR...
          </div>
        )}
      </div>

      {/* Countdown */}
      <div className="text-2xl font-bold mb-6 text-gray-300">
        Kembali ke idle dalam {countdown} detik...
      </div>

      {/* Download URL (for manual copy) */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={downloadUrl}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-800 rounded-xl text-white text-sm border-2 border-gray-700"
          />
          <button
            onClick={handleCopyLink}
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-4 w-full max-w-md">
        <button
          onClick={handleContinue}
          className="w-full touch-button bg-gradient-to-r from-primary-500 to-primary-700 text-white text-xl font-bold py-6 px-12 rounded-2xl shadow-2xl"
        >
          Selesai Sekarang →
        </button>

        <p className="text-center text-gray-500 text-sm">
          Link aktif selama 30 hari
        </p>
      </div>
    </div>
  );
};

export default ShareScreen;

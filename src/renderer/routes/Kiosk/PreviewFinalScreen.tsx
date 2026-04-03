import React from 'react';
import { useStore } from '../../store/useStore';

const PreviewFinalScreen: React.FC = () => {
  const { kiosk, currentPackage, setScreen, setProcessedPhoto, config } = useStore();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processedPath, setProcessedPath] = React.useState<string | null>(null);

  const photos = kiosk.photos;
  const frame = kiosk.selectedFrame;

  React.useEffect(() => {
    // Process the photo with frame if not already done
    if (photos.length > 0 && !processedPath && !isProcessing) {
      processPhoto();
    }
  }, [photos, frame]);

  const processPhoto = async () => {
    if (photos.length === 0) return;

    setIsProcessing(true);

    try {
      // In demo mode, just use first photo as "processed"
      if (config.demoMode) {
        setTimeout(() => {
          setProcessedPath(photos[0]);
          setIsProcessing(false);
        }, 1500);
        return;
      }

      // Apply frame if selected
      let outputPath = photos[0];
      if (frame) {
        outputPath = await window.electronAPI.photo.applyFrame(photos[0], frame);
      }

      setProcessedPath(outputPath);
    } catch (error: any) {
      console.error('Processing failed:', error);
      alert(`Failed to process photo: ${error.message}`);
      setProcessedPath(photos[0]); // fallback
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintOnly = () => {
    setProcessedPhoto(processedPath);
    setScreen('print');
  };

  const handleEmailThenShare = () => {
    setProcessedPhoto(processedPath);
    setScreen('email');
  };

  const handleBoth = async () => {
    setProcessedPhoto(processedPath);
    // For demo, just go to email (print happens in background)
    setScreen('email');
  };

  const handleReselectFrame = () => {
    setProcessedPhoto(null);
    setScreen('preview');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-black to-gray-900 p-8">
      {/* Back button */}
      <button
        onClick={handleReselectFrame}
        className="absolute top-8 left-8 text-white text-2xl p-4 rounded-full hover:bg-white/10 transition-colors"
      >
        ← Pilih Frame Lain
      </button>

      <h1 className="text-3xl font-display font-bold mb-2 text-center text-white mt-16">
        Preview Final
      </h1>
      <p className="text-gray-400 text-center mb-8">
        Lihat hasil akhir sebelum cetak/email
      </p>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center">
        {isProcessing ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300">Memproses foto...</p>
          </div>
        ) : processedPath ? (
          <div className="relative">
            <img
              src={`file://${processedPath}`}
              alt="Preview"
              className="max-h-[60vh] w-auto rounded-2xl shadow-2xl border-4 border-gray-700"
            />

            {/* Overlay info */}
            <div className="absolute -bottom-8 left-0 right-0 text-center text-gray-400 text-sm">
              {currentPackage?.name} • {photos.length} foto
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center">
            <div className="text-6xl mb-4">📷</div>
            <p>Tidak ada foto</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="pt-8 pb-4 space-y-4">
        {!isProcessing && processedPath && (
          <>
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                onClick={handlePrintOnly}
                className="touch-button bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold py-6 px-6 rounded-2xl shadow-xl flex flex-col items-center"
              >
                <span className="text-4xl mb-2">🖨️</span>
                <span>Cetak Saja</span>
              </button>

              <button
                onClick={handleEmailThenShare}
                className="touch-button bg-gradient-to-r from-green-600 to-green-700 text-white text-xl font-bold py-6 px-6 rounded-2xl shadow-xl flex flex-col items-center"
              >
                <span className="text-4xl mb-2">📧</span>
                <span>Kirim Email</span>
              </button>
            </div>

            <div className="max-w-2xl mx-auto">
              <button
                onClick={handleBoth}
                className="w-full touch-button bg-gradient-to-r from-purple-600 to-purple-700 text-white text-2xl font-bold py-6 rounded-2xl shadow-xl"
              >
                Cetak & Kirim Email
              </button>
            </div>
          </>
        )}

        {isProcessing && (
          <p className="text-center text-gray-500">
            Tunggu sebentar...
          </p>
        )}
      </div>
    </div>
  );
};

export default PreviewFinalScreen;

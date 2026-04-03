import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';

const FrameSelect: React.FC = () => {
  const { kiosk, frames, setSelectedFrame, setScreen } = useStore();
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);

  useEffect(() => {
    if (kiosk.photos.length === 0) {
      setScreen('capture');
    }
  }, [kiosk.photos, setScreen]);

  const handleSelectFrame = (frameId: string | null) => {
    setSelectedFrameId(frameId);
    if (frameId) {
      const frame = frames.find(f => f.id === frameId);
      setSelectedFrame(frame || null);
    }
  };

  const handleContinue = async () => {
    // Go to preview-final screen where processing will happen
    setScreen('preview-final');
  };

  const handleBack = () => {
    setScreen('capture'); // Go back to capture to retake photos
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-black to-gray-900 p-8">
      <button
        onClick={handleBack}
        className="absolute top-8 left-8 text-white text-2xl p-4 rounded-full hover:bg-white/10 transition-colors"
      >
        ← Retake
      </button>

      <h1 className="text-3xl font-display font-bold mb-2 text-center text-white">Pilih Frame</h1>
      <p className="text-gray-400 text-center mb-8">Pilih desain frame untuk fotomu</p>

      {/* Preview of photos */}
      <div className="flex justify-center items-end gap-4 mb-12 h-64">
        {kiosk.photos.slice(0, 4).map((photo, idx) => (
          <img
            key={idx}
            src={`file://${photo}`}
            alt={`Photo ${idx + 1}`}
            className="h-48 w-auto object-cover rounded-xl shadow-lg border-2 border-gray-700"
          />
        ))}
      </div>

      {/* Frame selection */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto pb-8">
          {/* No frame option */}
          <div
            onClick={() => handleSelectFrame(null)}
            className={`cursor-pointer rounded-2xl p-4 border-4 transition-all ${
              selectedFrameId === null
                ? 'border-primary-500 bg-primary-500/20 scale-105'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
            }`}
          >
            <div className="aspect-square bg-gray-700 rounded-xl mb-3 flex items-center justify-center">
              <span className="text-4xl">🚫</span>
            </div>
            <p className="text-center font-semibold text-white">Tanpa Frame</p>
          </div>

          {/* Frame templates */}
          {frames.map((frame) => (
            <div
              key={frame.id}
              onClick={() => handleSelectFrame(frame.id)}
              className={`cursor-pointer rounded-2xl p-4 border-4 transition-all ${
                selectedFrameId === frame.id
                  ? 'border-primary-500 bg-primary-500/20 scale-105'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <img
                src={`file://${frame.previewImage}`}
                alt={frame.name}
                className="aspect-square object-cover rounded-xl mb-3"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <p className="text-center font-semibold text-white">{frame.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <div className="pt-6 pb-8">
        <button
          onClick={handleContinue}
          className="w-full max-w-md mx-block touch-button bg-gradient-to-r from-primary-500 to-primary-700 text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-2xl"
        >
          Lanjutkan →
        </button>
      </div>
    </div>
  );
};

export default FrameSelect;

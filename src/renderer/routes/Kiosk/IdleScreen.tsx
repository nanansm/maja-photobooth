import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';

const IdleScreen: React.FC = () => {
  const { setScreen, config } = useStore();
  const [showTouchPrompt, setShowTouchPrompt] = useState(true);

  useEffect(() => {
    // Pulse animation for touch prompt
    const interval = setInterval(() => {
      setShowTouchPrompt(prev => !prev);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    setScreen('package-select');
  };

  // Fullscreen background with logo
  return (
    <div
      className="relative flex flex-col items-center justify-center h-full cursor-pointer select-none"
      onClick={handleStart}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900 to-black opacity-90"></div>

      {/* Logo section */}
      <div className="relative z-10 flex flex-col items-center">
        {config.logoPath ? (
          <img
            src={`file://${config.logoPath}`}
            alt="Logo"
            className="w-48 h-48 object-contain mb-8"
          />
        ) : (
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-8 shadow-2xl">
            <span className="text-6xl">📸</span>
          </div>
        )}

        <h1 className="text-6xl font-display font-bold mb-4 text-center" style={{ color: config.themeColor }}>
          Maja Photobooth
        </h1>

        {/* Touch prompt with pulse animation */}
        <div
          className={`mt-12 px-12 py-6 rounded-3xl border-4 border-white/30 transition-all duration-500 ${
            showTouchPrompt ? 'scale-110 opacity-100' : 'scale-100 opacity-60'
          }`}
        >
          <p className="text-2xl font-semibold text-center">
            {config.idleText || 'Sentuh untuk mulai'}
          </p>
          <div className="mt-2 flex justify-center">
            <span className="text-4xl animate-bounce">👆</span>
          </div>
        </div>
      </div>

      {/* Ambient particles (optional) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary-500 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default IdleScreen;

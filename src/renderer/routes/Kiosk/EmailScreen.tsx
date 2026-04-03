import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';

// Virtual Keyboard Component
const VirtualKeyboard: React.FC<{
  onKey: (key: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onDone: () => void;
}> = ({ onKey, onBackspace, onSpace, onDone }) => {
  const keys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ['@', '.', '-', '_', 'Space', 'Done']
  ];

  const getKeyClass = (key: string) => {
    const baseClass = "px-3 py-4 rounded-xl font-bold text-xl transition-all active:scale-95";
    const colorClass = key === 'Space' || key === 'Done'
      ? "bg-primary-600 text-white"
      : "bg-gray-700 text-white hover:bg-gray-600";
    return `${baseClass} ${colorClass}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2 mb-2">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === 'Space') {
                  onSpace();
                } else if (key === 'Done') {
                  onDone();
                } else {
                  onKey(key);
                }
              }}
              className={getKeyClass(key)}
              style={{ minWidth: key === 'Space' ? 200 : 60 }}
            >
              {key === 'Space' ? 'Space' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

const EmailScreen: React.FC = () => {
  const {
    kiosk,
    setScreen,
    setCustomerEmail,
    sendEmail,
    setEmailSending,
    setEmailError
  } = useStore();

  const [email, setEmail] = useState(kiosk.customerEmail);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [success, setSuccess] = useState(false);

  // Auto-focus
  useEffect(() => {
    setShowKeyboard(true);
  }, []);

  const handleKeyPress = (key: string) => {
    setEmail(prev => prev + key);
  };

  const handleBackspace = () => {
    setEmail(prev => prev.slice(0, -1));
  };

  const handleSpace = () => {
    setEmail(prev => prev + ' ');
  };

  const handleDone = () => {
    setShowKeyboard(false);
    handleSubmit();
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setEmailError('Email tidak valid');
      return;
    }

    setEmailSending(true);
    setEmailError(null);
    setCustomerEmail(email);

    try {
      await sendEmail();
      setSuccess(true);
    } catch (error: any) {
      setEmailError(error.message || 'Gagal mengirim email');
    } finally {
      setEmailSending(false);
    }
  };

  const handleSkip = () => {
    setScreen('share');
  };

  const handleRetry = () => {
    setEmailError(null);
    setEmailSending(false);
  };

  // Success state
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-green-900/30 to-black p-8">
        <div className="text-8xl mb-8 animate-bounce">✅</div>
        <h1 className="text-4xl font-display font-bold text-green-400 mb-4">Email Terkirim!</h1>
        <p className="text-xl text-gray-300 mb-2">Ke: {email}</p>
        <p className="text-lg text-gray-400 mb-12">Foto sudah dikirim ke email kamu</p>

        <button
          onClick={() => setScreen('share')}
          className="touch-button bg-primary-600 text-white px-12 py-6 text-2xl font-bold rounded-2xl shadow-2xl"
        >
          Lanjut →
        </button>
      </div>
    );
  }

  // Sending state
  if (kiosk.emailSending) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-primary-900/30 to-black p-8">
        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary-500 mb-8"></div>
        <h1 className="text-3xl font-display font-bold mb-4">Mengirim Email...</h1>
        <p className="text-lg text-gray-400">Mohon tunggu sebentar</p>
        <p className="text-sm text-gray-500 mt-4">{kiosk.emailError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-black via-gray-900 to-black p-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => {
            if (email.length > 0) {
              if (confirm('Kembali? Input email akan hilang.')) {
                setScreen('print');
              }
            } else {
              setScreen('print');
            }
          }}
          className="text-white text-2xl p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          ← Kembali
        </button>
        <h1 className="text-2xl font-display font-bold ml-4">Input Email</h1>
      </div>

      {/* Progress */}
      <div className="text-center text-gray-500 mb-6">
        Langkah 7 dari 9
      </div>

      {/* Email Display */}
      <div className="text-center mb-8">
        <div className="text-3xl font-mono bg-gray-800 rounded-2xl p-6 min-h-[80px] flex items-center justify-center max-w-2xl mx-auto">
          {email || (
            <span className="text-gray-500 text-xl">Ketik email kamu di keyboard...</span>
          )}
        </div>

        {/* Real-time validation */}
        {email && !validateEmail(email) && (
          <p className="text-red-400 mt-4 text-lg">⚠️ Format email tidak valid</p>
        )}
      </div>

      {/* Virtual Keyboard */}
      {showKeyboard && (
        <div className="flex-1 flex flex-col justify-center">
          <VirtualKeyboard
            onKey={handleKeyPress}
            onBackspace={handleBackspace}
            onSpace={handleSpace}
            onDone={handleDone}
          />

          {/* Backspace key full width */}
          <div className="flex justify-center mt-2">
            <button
              onClick={handleBackspace}
              className="px-8 py-4 bg-red-700 hover:bg-red-600 rounded-xl font-bold text-xl transition-all"
            >
              ⌫ Backspace
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {kiosk.emailError && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6">
          <p className="text-red-200">{kiosk.emailError}</p>
          <button
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 rounded font-semibold text-sm"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4 mt-auto">
        <button
          onClick={handleSkip}
          className="flex-1 touch-button bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold py-6 rounded-2xl"
        >
          Lewati Email →
        </button>

        <button
          onClick={handleSubmit}
          disabled={!validateEmail(email) || kiosk.emailSending}
          className="flex-[2] touch-button bg-gradient-to-r from-primary-500 to-primary-700 text-white text-2xl font-bold py-6 rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Kirim Email 📧
        </button>
      </div>

      {/* Helper text */}
      <p className="text-center text-gray-500 text-sm mt-4">
        Ketik email dengan keyboard virtual, lalu tekan "Done" atau tombol Kirim
      </p>
    </div>
  );
};

export default EmailScreen;

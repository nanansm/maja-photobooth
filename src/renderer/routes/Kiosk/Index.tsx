import React from 'react';
import { useStore } from '../../store/useStore';
import IdleScreen from './IdleScreen';
import PackageSelect from './PackageSelect';
import PaymentScreen from './PaymentScreen';
import CaptureScreen from './CaptureScreen';
import FrameSelect from './FrameSelect';
import PreviewFinalScreen from './PreviewFinalScreen';
import PrintScreen from './PrintScreen';
import EmailScreen from './EmailScreen';
import ShareScreen from './ShareScreen';

const KioskRouter: React.FC = () => {
  const { kiosk, config } = useStore();
  const { currentScreen } = kiosk;

  // Apply theme color
  const themeColor = config.themeColor || '#0ea5e9';

  const screenStyle: React.CSSProperties = {
    backgroundColor: '#000000',
    color: '#ffffff',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative'
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'idle':
        return <IdleScreen />;
      case 'package-select':
        return <PackageSelect />;
      case 'payment':
        return <PaymentScreen />;
      case 'capture':
        return <CaptureScreen />;
      case 'preview':
        return <FrameSelect />;
      case 'processing':
        return <ProcessingScreen />;
      case 'preview-final':
        return <PreviewFinalScreen />;
      case 'print':
        return <PrintScreen />;
      case 'email':
        return <EmailScreen />;
      case 'share':
        return <ShareScreen />;
      case 'complete':
        return <CompleteScreen />;
      default:
        return <IdleScreen />;
    }
  };

  return (
    <div style={screenStyle}>
      {/* Header with admin button (hidden in prod) */}
      <button
        onClick={() => {
          // Quick admin access (hold for 3 seconds would be better for production)
          const password = prompt('Admin password:');
          if (password) {
            useStore.getState().authenticate(password).then(success => {
              if (!success) {
                alert('Invalid password');
              }
            });
          }
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          opacity: 0.3,
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '8px',
          color: '#666',
          fontSize: '12px'
        }}
      >
        ⚙️
      </button>

      {/* Main screen content */}
      {renderScreen()}
    </div>
  );
};

// Processing screen component (inline)
const ProcessingScreen: React.FC = () => {
  const { kiosk } = useStore();
  const { photos, selectedFrame } = kiosk;

  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState('Processing photos...');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const process = async () => {
      setProgress(20);
      setStatus('Applying frame...');

      // Simulate processing (actual processing happens in backend)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(60);
      setStatus('Creating print layout...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(80);
      setStatus('Preparing print...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(100);
      setStatus('Ready to print!');

      await new Promise(resolve => setTimeout(resolve, 500));

      useStore.getState().setScreen('print');
    };

    // In demo mode, simulate progress. In prod, call actual photo processor
    if (config.demoMode) {
      interval = setInterval(() => {
        process();
      }, 100);
    } else {
      process();
    }

    return () => clearInterval(interval);
  }, [photos, selectedFrame]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-display font-bold mb-8">Processing</h1>
      <div className="w-80 h-80 relative">
        <div
          className="absolute inset-0 rounded-full border-8 border-gray-700"
        ></div>
        <div
          className="absolute inset-0 rounded-full border-8 border-primary-500 transform -rotate-90"
          style={{
            clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
            borderColor: themeColor
          }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold">{Math.round(progress)}%</span>
        </div>
      </div>
      <p className="text-xl mt-8 text-gray-300">{status}</p>
    </div>
  );
};

// Complete screen
const CompleteScreen: React.FC = () => {
  const { resetKiosk, setScreen } = useStore();

  const handleRestart = () => {
    resetKiosk();
    setScreen('idle');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-8xl mb-8">✅</div>
      <h1 className="text-5xl font-display font-bold mb-4">Terima Kasih!</h1>
      <p className="text-2xl text-gray-300 mb-12">Semoga harimu menyenangkan</p>

      <button
        onClick={handleRestart}
        className="touch-button bg-gradient-to-r from-primary-500 to-primary-700 px-12 py-6 text-2xl font-bold shadow-2xl pulse-glow"
      >
        Selesai
      </button>
    </div>
  );
};

export default KioskRouter;

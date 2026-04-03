import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import KioskRouter from './routes/Kiosk/Index';
import AdminRouter from './routes/Admin/Index';

const App: React.FC = () => {
  const { loadConfig, loadPackages, loadFrames, admin, config } = useStore();

  useEffect(() => {
    // Load initial data
    const initialize = async () => {
      await loadConfig();
      await loadPackages();
      await loadFrames();

      // Check if demo mode is enabled
      if (config.demoMode) {
        console.log('Running in DEMO mode');
      }
    };

    initialize();
  }, [loadConfig, loadPackages, loadFrames, config.demoMode]);

  // Show admin panel if authenticated
  if (admin.isAuthenticated) {
    return <AdminRouter />;
  }

  // Otherwise show kiosk
  return <KioskRouter />;
};

export default App;

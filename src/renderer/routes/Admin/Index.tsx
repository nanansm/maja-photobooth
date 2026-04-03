import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import Dashboard from './Dashboard';
import Packages from './Packages';
import Frames from './Frames';
import Settings from './Settings';
import History from './History';

const AdminRouter: React.FC = () => {
  const { admin, setAdminTab, logout, loadStats, loadPackages, loadFrames, loadSessions } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await loadStats();
      await loadPackages();
      await loadFrames();
      await loadSessions(100);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'packages', label: '📦 Paket', icon: '📦' },
    { id: 'frames', label: '🖼️ Frame', icon: '🖼️' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
    { id: 'history', label: '📜 History', icon: '📜' }
  ] as const;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
        </div>
      );
    }

    switch (admin.activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'packages':
        return <Packages />;
      case 'frames':
        return <Frames />;
      case 'settings':
        return <Settings />;
      case 'history':
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-display font-bold">🖼️ Maja Photobooth Admin</h1>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  admin.activeTab === tab.id
                    ? 'bg-primary-600 text-white border-b-2 border-primary-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminRouter;

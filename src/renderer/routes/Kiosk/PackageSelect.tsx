import React from 'react';
import { useStore } from '../../store/useStore';

const PackageSelect: React.FC = () => {
  const { packages, setCurrentPackage, setScreen } = useStore();

  const handleSelect = (pkg: typeof packages[0]) => {
    setCurrentPackage(pkg);
    setScreen('payment');
  };

  const handleBack = () => {
    setScreen('idle');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-b from-black via-gray-900 to-black">
      <button
        onClick={handleBack}
        className="absolute top-8 left-8 text-white text-2xl p-4 rounded-full hover:bg-white/10 transition-colors"
      >
        ← Kembali
      </button>

      <h1 className="text-4xl font-display font-bold mb-4">Pilih Paket</h1>
      <p className="text-gray-400 mb-12 text-lg">Pilih paket foto yang kamu suka</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full">
        {packages.filter(p => p.isActive).map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => handleSelect(pkg)}
            className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:bg-gray-700 border-2 border-transparent hover:border-primary-500"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-3xl"
              style={{ backgroundColor: `${useStore.getState().config.themeColor}20` }}
            >
              {pkg.id.includes('digital') ? '💻' : '🖼️'}
            </div>

            <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>

            <div className="text-3xl font-bold mb-4" style={{ color: useStore.getState().config.themeColor }}>
              Rp {pkg.price.toLocaleString('id-ID')}
            </div>

            <div className="space-y-3 text-gray-300">
              <div className="flex items-center gap-3">
                <span className="text-xl">📷</span>
                <span>{pkg.photoCount} foto</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">🖨️</span>
                <span>{pkg.printCount} cetak</span>
              </div>
              {pkg.digitalCopy && (
                <div className="flex items-center gap-3">
                  <span className="text-xl">📱</span>
                  <span>Digital copy</span>
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-primary-500/20 rounded-xl border border-primary-500/50">
              <p className="text-sm text-gray-300 text-center">
                Tap untuk pilih paket ini
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackageSelect;

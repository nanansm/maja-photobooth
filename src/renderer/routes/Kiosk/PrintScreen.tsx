import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';

const PrintScreen: React.FC = () => {
  const { kiosk, currentPackage, setScreen } = useStore();
  const [printerList, setPrinterList] = useState<any[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState('');
  const [showPrinters, setShowPrinters] = useState(false);
  const [printComplete, setPrintComplete] = useState(false);
  const [noPrinterNeeded, setNoPrinterNeeded] = useState(currentPackage?.printCount === 0);

  useEffect(() => {
    loadPrinters();

    // Select default printer from config if available
    const config = useStore.getState().config;
    if (config.defaultPrinter) {
      setSelectedPrinter(config.defaultPrinter);
    }
  }, []);

  const loadPrinters = async () => {
    try {
      const printers = await window.electronAPI.printer.list();
      setPrinterList(printers);

      if (printers.length > 0 && !selectedPrinter) {
        const defaultPrinter = printers.find(p => p.isDefault) || printers[0];
        setSelectedPrinter(defaultPrinter.name);
      }
    } catch (error) {
      console.error('Failed to load printers:', error);
      alert('No printers found. Please connect a printer.');
    }
  };

  const handlePrint = async () => {
    if (!selectedPrinter) {
      alert('Please select a printer');
      return;
    }

    if (kiosk.processedPhoto && currentPackage) {
      setIsPrinting(true);
      setPrintStatus('Sending to printer...');

      try {
        await window.electronAPI.printer.print(kiosk.processedPhoto, {
          printerName: selectedPrinter,
          copies: currentPackage.printCount,
          paperSize: '4x6',
          quality: 'high',
          colorMode: 'color'
        });

        setPrintStatus('Printing complete! ✓');
        setPrintComplete(true);
        setIsPrinting(false);
      } catch (error: any) {
        console.error('Print failed:', error);
        setPrintStatus(`Print failed: ${error.message}`);
        setIsPrinting(false);
      }
    }
  };

  const handleEmailAfterPrint = () => {
    setScreen('email');
  };

  const handleSkipToShare = () => {
    if (currentPackage?.digitalCopy) {
      setScreen('share');
    } else {
      setScreen('complete');
    }
  };

  const handleSkip = () => {
    // This is for "Skip printing" button at top
    if (currentPackage?.digitalCopy) {
      setScreen('share');
    } else {
      setScreen('complete');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-black via-gray-900 to-black p-8">
      <h1 className="text-3xl font-display font-bold mb-2 text-center">Cetak Foto</h1>
      <p className="text-gray-400 text-center mb-8">
        {currentPackage?.printCount > 0
          ? ` Printing ${currentPackage.printCount} copy${currentPackage.printCount > 1 ? 'ies' : ''} to ${selectedPrinter}`
          : 'No prints included in this package'}
      </p>

      {/* Printer status */}
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full mb-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg text-gray-300">Printer:</span>
          <button
            onClick={() => setShowPrinters(!showPrinters)}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold"
          >
            {selectedPrinter || 'Select Printer'}
          </button>
        </div>

        {/* Printer selector dropdown */}
        {showPrinters && (
          <div className="space-y-3 mb-6">
            {printerList.map((printer) => (
              <div
                key={printer.name}
                onClick={() => {
                  setSelectedPrinter(printer.name);
                  setShowPrinters(false);
                }}
                className={`p-4 rounded-xl cursor-pointer border-2 ${
                  selectedPrinter === printer.name
                    ? 'border-primary-500 bg-primary-500/20'
                    : 'border-gray-700 bg-gray-700/30'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{printer.name}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      printer.isOnline
                        ? 'bg-green-500/30 text-green-400'
                        : 'bg-red-500/30 text-red-400'
                    }`}
                  >
                    {printer.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                {printer.isDefault && (
                  <span className="text-xs text-primary-400">Default</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Print status */}
        {isPrinting && (
          <div className="mt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500"></div>
            </div>
            <p className="text-center text-gray-300">{printStatus}</p>
          </div>
        )}

        {/* Print complete - show email option */}
        {printComplete && !isPrinting && (
          <div className="mt-6 space-y-4">
            <div className="bg-green-900/30 border border-green-700 rounded-xl p-4 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-green-300 font-semibold">Pencetakan Selesai!</p>
              <p className="text-green-400/80 text-sm mt-1">
                Ambil fotomu di printer ya 📷
              </p>
            </div>

            <button
              onClick={handleEmailAfterPrint}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-bold rounded-xl text-xl hover:from-primary-600 hover:to-primary-800 transition-all shadow-lg"
            >
              📧 Lanjut Kirim Email
            </button>

            {currentPackage?.digitalCopy && (
              <button
                onClick={handleSkipToShare}
                className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl text-xl transition-colors"
              >
                Skip Email → Download
              </button>
            )}
          </div>
        )}

        {/* No print needed (digital only package) */}
        {noPrinterNeeded && !isPrinting && !printComplete && (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-6 text-center">
              <p className="text-blue-200 mb-4">
                Paket ini tidak mencakup cetak foto.
              </p>
              <p className="text-blue-300">
                Kamu akan langsung ke email atau download.
              </p>
            </div>

            <button
              onClick={handleEmailAfterPrint}
              className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl text-xl hover:bg-primary-700 transition-colors"
            >
              📧 Kirim Email
            </button>

            <button
              onClick={handleSkipToShare}
              className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl text-xl transition-colors"
            >
              Skip → Download
            </button>
          </div>
        )}

        {/* Initial print button */}
        {!isPrinting && !printComplete && !noPrinterNeeded && (
          <div className="mt-6">
            <button
              onClick={handlePrint}
              disabled={!selectedPrinter}
              className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl text-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cetak Foto Sekarang 🖨️
            </button>

            <button
              onClick={handleSkip}
              className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl text-lg mt-4 transition-colors"
            >
              Lewati Cetak → Lanjut
            </button>
          </div>
        )}
      </div>

      {/* Skip button - shown when not needed */}
      {(isPrinting || printComplete) && (
        <button
          onClick={handleSkip}
          className="text-gray-500 hover:text-white text-lg transition-colors"
        >
          Kembali
        </button>
      )}
    </div>
  );
};

export default PrintScreen;

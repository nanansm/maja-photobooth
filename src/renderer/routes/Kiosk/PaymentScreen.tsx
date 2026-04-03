import React, { useEffect, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { useStore } from '../../store/useStore';
import * as types from '../../../shared/types';

const PaymentScreen: React.FC = () => {
  const { kiosk, currentPackage, setScreen, setSessionId, setPaymentStatus } = useStore();
  const [invoice, setInvoice] = useState<types.XenditInvoice | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!currentPackage) {
      setScreen('package-select');
      return;
    }

    createInvoice();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [currentPackage]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setPaymentStatus('expired');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, setPaymentStatus]);

  // Listen for payment confirmation via webhook
  useEffect(() => {
    const unsubscribe = window.electronAPI.payment.onConfirmed((session) => {
      console.log('Payment confirmed:', session);
      setPaymentConfirmed(true);
      setPaymentStatus('paid');
      setSessionId(session.id);

      // Clear polling interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }

      // Move to capture after short delay
      setTimeout(() => {
        setScreen('capture');
      }, 2000);
    });

    return () => unsubscribe();
  }, [pollingInterval, setSessionId, setPaymentStatus, setScreen]);

  const createInvoice = async () => {
    try {
      const sessionId = `session-${Date.now()}`;
      setSessionId(sessionId);

      const invoiceData = await window.electronAPI.payment.createInvoice(
        sessionId,
        currentPackage!.price,
        currentPackage!.id
      );

      setInvoice(invoiceData);

      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(invoiceData.qrCode, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrCodeDataUrl);

      // Start polling for payment status (as fallback if webhook fails)
      startPolling(invoiceData.id);
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      alert(`Payment setup failed: ${error.message}. Please contact admin.`);
      setScreen('package-select');
    }
  };

  const startPolling = (invoiceId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await window.electronAPI.payment.checkStatus(invoiceId);

        if (status.status === 'paid') {
          if (!paymentConfirmed) {
            setPaymentConfirmed(true);
            setPaymentStatus('paid');

            // This should also emit the webhook event - we need to trigger it manually if webhook wasn't received
            setTimeout(() => {
              setScreen('capture');
            }, 2000);
          }

          clearInterval(interval);
        } else if (status.status === 'expired' || status.status === 'failed') {
          setPaymentStatus(status.status);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    setPollingInterval(interval);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    setScreen('package-select');
  };

  if (paymentConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-green-600/20">
        <div className="text-8xl mb-8 animate-bounce">✅</div>
        <h1 className="text-5xl font-display font-bold text-green-400 mb-4">Pembayaran Berhasil!</h1>
        <p className="text-2xl text-gray-300">Mohon tunggu sebentar...</p>
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-red-600/20">
        <div className="text-8xl mb-8">⏰</div>
        <h1 className="text-5xl font-display font-bold text-red-400 mb-4">Waktu Habis</h1>
        <p className="text-2xl text-gray-300 mb-8">Silakan pilih paket lagi</p>
        <button
          onClick={() => setScreen('package-select')}
          className="touch-button bg-red-600 text-white px-12 py-6 text-2xl font-bold rounded-2xl"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-b from-primary-900 to-black">
      <button
        onClick={handleCancel}
        className="absolute top-8 left-8 text-white text-2xl p-4 rounded-full hover:bg-white/10 transition-colors"
      >
        ← Batal
      </button>

      <h1 className="text-3xl font-display font-bold mb-2 text-center">Scan QR untuk Bayar</h1>
      <p className="text-gray-400 mb-8 text-center">
        {currentPackage?.name} - Rp {currentPackage?.price.toLocaleString('id-ID')}
      </p>

      {/* QR Code */}
      <div className="relative mb-8">
        {qrCodeUrl && (
          <img
            src={qrCodeUrl}
            alt="QRIS Payment"
            className="w-80 h-80 bg-white rounded-3xl shadow-2xl pulse-glow"
          />
        )}
      </div>

      {/* Timer */}
      <div className="text-6xl font-mono font-bold mb-4" style={{ color: useStore.getState().config.themeColor }}>
        {formatTime(timeLeft)}
      </div>

      <p className="text-lg text-gray-300 mb-8 text-center max-w-md">
        Scan QR code di atas dengan aplikasi pembayaranmu (GoPay, DANA, ShopeePay, dll)
      </p>

      {/* Payment methods icons (simplified) */}
      <div className="flex gap-8 mb-8 text-3xl">
        <span title="GoPay">🟢</span>
        <span title="DANA">🔵</span>
        <span title="ShopeePay">🟡</span>
        <span title="OVO">🟣</span>
      </div>

      <p className="text-sm text-gray-500">
        Status: {paymentConfirmed ? '✅ Paid' : `⏳ Menunggu pembayaran...`}
      </p>
    </div>
  );
};

export default PaymentScreen;

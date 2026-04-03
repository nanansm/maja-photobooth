import { describe, it, expect } from 'vitest';
import * as types from '../src/shared/types';

describe('Types', () => {
  it('should have proper Camera interface', () => {
    const camera: types.Camera = {
      id: 'canon-eos-r100',
      model: 'Canon EOS R100',
      port: 'usb',
      isConnected: true
    };

    expect(camera.id).toBeDefined();
    expect(camera.model).toBeDefined();
    expect(camera.port).toBe('usb');
  });

  it('should have proper Package interface', () => {
    const pkg: types.Package = {
      id: 'basic',
      name: 'Basic Package',
      price: 15000,
      photoCount: 4,
      printCount: 1,
      digitalCopy: true,
      isActive: true,
      sortOrder: 1
    };

    expect(pkg.price).toBe(15000);
    expect(pkg.photoCount).toBeGreaterThan(0);
  });

  it('should have proper PaymentStatus interface', () => {
    const status: types.PaymentStatus = {
      status: 'paid',
      invoiceId: 'inv_123',
      paidAt: new Date().toISOString(),
      amount: 15000
    };

    expect(['pending', 'paid', 'expired', 'failed']).toContain(status.status);
  });

  it('should have proper PrintOptions interface', () => {
    const options: types.PrintOptions = {
      printerName: 'Epson SureLab D530',
      copies: 2,
      paperSize: '4x6',
      quality: 'high',
      colorMode: 'color'
    };

    expect(['4x6', '2x6', '5x7', 'A4']).toContain(options.paperSize);
    expect(['draft', 'normal', 'high']).toContain(options.quality);
  });

  it('should have proper FrameTemplate interface', () => {
    const frame: types.FrameTemplate = {
      id: 'wedding-gold',
      name: 'Wedding Gold',
      previewImage: 'assets/frames/wedding-preview.jpg',
      overlayImage: 'assets/frames/wedding-overlay.png',
      photoSlots: [
        { x: 40, y: 80, width: 420, height: 280 }
      ],
      canvasWidth: 500,
      canvasHeight: 750,
      isActive: true
    };

    expect(frame.photoSlots.length).toBeGreaterThan(0);
    expect(frame.canvasWidth).toBeGreaterThan(0);
  });
});

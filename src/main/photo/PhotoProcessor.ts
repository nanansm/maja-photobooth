import sharp from 'sharp';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import * as types from '../../shared/types';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export class PhotoProcessor {
  private outputDir: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.outputDir = path.join(userDataPath, 'processed');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async createStrip(photos: string[], layout: types.StripLayout): Promise<string> {
    if (photos.length === 0) {
      throw new Error('No photos provided');
    }

    const { photoWidth, photoHeight, spacing, columns, orientation } = layout;

    const numRows = Math.ceil(photos.length / columns);
    const totalWidth = columns * photoWidth + (columns - 1) * spacing;
    const totalHeight = numRows * photoHeight + (numRows - 1) * spacing;

    const canvas = createCanvas(totalWidth, totalHeight);
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Draw photos
    for (let i = 0; i < photos.length; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);

      const x = col * (photoWidth + spacing);
      const y = row * (photoHeight + spacing);

      try {
        const image = await loadImage(photos[i]);

        // Resize and draw
        ctx.drawImage(image, x, y, photoWidth, photoHeight);
      } catch (error) {
        console.error(`Failed to load photo ${photos[i]}:`, error);
        throw error;
      }
    }

    // Save output
    const outputPath = path.join(this.outputDir, `strip-${Date.now()}.jpg`);
    const buffer = canvas.toBuffer('image/jpeg', { quality: 90 });

    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }

  async applyFrame(photoPath: string, frameTemplate: types.FrameTemplate): Promise<string> {
    const { overlayImage, photoSlots, canvasWidth, canvasHeight } = frameTemplate;

    if (!fs.existsSync(overlayImage)) {
      throw new Error(`Frame overlay not found: ${overlayImage}`);
    }

    // Load the original photo (we'll use the first slot for now - single frame)
    const photo = await loadImage(photoPath);
    const frame = await loadImage(overlayImage);

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Fill white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw photo in each slot
    for (const slot of photoSlots) {
      ctx.save();
      ctx.translate(slot.x + slot.width / 2, slot.y + slot.height / 2);
      if (slot.rotation) {
        ctx.rotate((slot.rotation * Math.PI) / 180);
      }
      ctx.drawImage(photo, -slot.width / 2, -slot.height / 2, slot.width, slot.height);
      ctx.restore();
    }

    // Overlay frame PNG on top
    ctx.drawImage(frame, 0, 0, canvasWidth, canvasHeight);

    // Save output
    const outputFilename = `framed-${Date.now()}.png`;
    const outputPath = path.join(this.outputDir, outputFilename);
    const buffer = canvas.toBuffer('image/png');

    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }

  async applyFilter(photoPath: string, filter: string, intensity: number = 1.0): Promise<string> {
    const outputPath = path.join(this.outputDir, `filtered-${filter}-${Date.now()}.jpg`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let img: any = sharp(photoPath);

    switch (filter) {
      case 'grayscale':
        img = img.grayscale();
        break;
      case 'sepia':
        img = img.sepia();
        break;
      case 'vivid':
        img = img.modulate({ saturation: 1.5 });
        break;
      case 'contrast':
        img = img.linear(1.2, 0);
        break;
      case 'brighten':
        img = img.modulate({ brightness: 1.1 });
        break;
      case 'warm':
        // Using alternative: increase brightness and saturation for warm effect
        img = img.modulate({ brightness: 1.05, saturation: 1.1 });
        break;
      case 'cool':
        // Using alternative: decrease brightness and saturation for cool effect
        img = img.modulate({ brightness: 0.95, saturation: 0.9 });
        break;
      default:
        throw new Error(`Unknown filter: ${filter}`);
    }

    await img.jpeg({ quality: 90 }).toFile(outputPath);
    return outputPath;
  }

  async createCollage(photos: string[], template: types.CollageTemplate): Promise<string> {
    const { config, type } = template;

    if (type === 'grid' || type === 'strip') {
      return this.createStrip(photos, config);
    }

    // Custom collage logic based on template
    const { photoWidth, photoHeight, spacing, columns, rows } = config;

    const totalWidth = columns * photoWidth + (columns - 1) * spacing;
    const totalHeight = rows * photoHeight + (rows - 1) * spacing;

    const canvas = createCanvas(totalWidth, totalHeight);
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Draw photos
    for (let i = 0; i < photos.length; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);

      if (row >= rows) break;

      const x = col * (photoWidth + spacing);
      const y = row * (photoHeight + spacing);

      try {
        const image = await loadImage(photos[i]);
        ctx.drawImage(image, x, y, photoWidth, photoHeight);
      } catch (error) {
        console.error(`Failed to load photo ${photos[i]}:`, error);
        throw error;
      }
    }

    // Save output
    const outputPath = path.join(this.outputDir, `collage-${Date.now()}.jpg`);
    const buffer = canvas.toBuffer('image/jpeg', { quality: 90 });

    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }

  async addTextOverlay(photoPath: string, config: types.TextOverlayConfig): Promise<string> {
    const { text, x, y, fontSize, fontFamily, color, rotation = 0 } = config;

    const photo = await loadImage(photoPath);
    const [width, height] = [photo.width, photo.height];

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw original photo
    ctx.drawImage(photo, 0, 0);

    // Configure text
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Rotation if needed
    if (rotation !== 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(text, x, y);
    }

    // Save output
    const outputPath = path.join(this.outputDir, `text-${Date.now()}.png`);
    const buffer = canvas.toBuffer('image/png');

    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }

  // Additional utility methods
  async resize(photoPath: string, width: number, height: number): Promise<string> {
    const outputPath = path.join(this.outputDir, `resized-${Date.now()}.jpg`);

    await sharp(photoPath)
      .resize(width, height, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    return outputPath;
  }

  async combineMultiple(photos: string[], options: { direction: 'vertical' | 'horizontal' } = { direction: 'vertical' }): Promise<string> {
    const images = await Promise.all(photos.map(p => sharp(p).metadata()));

    const isVertical = options.direction === 'vertical';
    const maxWidth = Math.max(...images.map(img => img.width!));
    const maxHeight = Math.max(...images.map(img => img.height!));

    let totalSize = 0;
    let spacing = 10;

    if (isVertical) {
      totalSize = images.reduce((sum, img) => sum + img.height!, 0) + (images.length - 1) * spacing;
    } else {
      totalSize = images.reduce((sum, img) => sum + img.width!, 0) + (images.length - 1) * spacing;
    }

    const canvasWidth = isVertical ? maxWidth : totalSize;
    const canvasHeight = isVertical ? totalSize : maxHeight;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Load and draw images
    let offset = 0;
    for (const photoPath of photos) {
      const img = await loadImage(photoPath);
      const metadata = await sharp(photoPath).metadata();

      const x = isVertical ? (canvasWidth - metadata.width!) / 2 : offset;
      const y = isVertical ? offset : (canvasHeight - metadata.height!) / 2;

      ctx.drawImage(img, x, y, metadata.width!, metadata.height!);

      if (isVertical) {
        offset += metadata.height! + spacing;
      } else {
        offset += metadata.width! + spacing;
      }
    }

    const outputPath = path.join(this.outputDir, `combined-${Date.now()}.jpg`);
    const buffer = canvas.toBuffer('image/jpeg', { quality: 90 });

    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }

  clearOutputDir(): void {
    if (fs.existsSync(this.outputDir)) {
      const files = fs.readdirSync(this.outputDir);
      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }
    }
  }
}

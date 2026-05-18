import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate CJS __dirname magic variables using native ES Module equivalents
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTER_IMAGE = path.join(
  __dirname,
  '../public/pwa-assets/master-splash.png',
);
const OUTPUT_DIR = path.join(__dirname, '../public/pwa-assets');

// Every single iOS device viewport resolution needed for Apple PWA splash screens
const sizes = [
  { w: 1320, h: 2868, name: 'apple-splash-1320-2868.png' }, // iPhone 16 Pro Max
  { w: 1206, h: 2622, name: 'apple-splash-1206-2622.png' }, // iPhone 16 Pro
  { w: 1290, h: 2796, name: 'apple-splash-1290-2796.png' }, // iPhone 15 Pro Max, 14 Pro Max
  { w: 1179, h: 2556, name: 'apple-splash-1179-2556.png' }, // iPhone 15 Pro, 15, 14 Pro
  { w: 1284, h: 2778, name: 'apple-splash-1284-2778.png' }, // iPhone 14 Plus, 13 Pro Max
  { w: 1170, h: 2532, name: 'apple-splash-1170-2532.png' }, // iPhone 14, 13 Pro, 13, 12 Pro
  { w: 1125, h: 2436, name: 'apple-splash-1125-2436.png' }, // iPhone 13 mini, 12 mini, X, Xs
  { w: 1242, h: 2688, name: 'apple-splash-1242-2688.png' }, // iPhone Xs Max, Xr
  { w: 828, h: 1792, name: 'apple-splash-828-1792.png' }, // iPhone 11, Xr
  { w: 1242, h: 2208, name: 'apple-splash-1242-2208.png' }, // iPhone 8 Plus, 7 Plus
  { w: 750, h: 1334, name: 'apple-splash-750-1334.png' }, // iPhone 8, 7, 6s, SE (Gen 2/3)
  { w: 640, h: 1136, name: 'apple-splash-640-1136.png' }, // iPhone SE (Gen 1)
  { w: 2048, h: 2732, name: 'apple-splash-2048-2732.png' }, // iPad Pro 12.9"
  { w: 1668, h: 2388, name: 'apple-splash-1668-2388.png' }, // iPad Pro 11"
  { w: 1640, h: 2360, name: 'apple-splash-1640-2360.png' }, // iPad Air 10.9"
  { w: 1536, h: 2048, name: 'apple-splash-1536-2048.png' }, // iPad mini, iPad 9.7"
];

async function generateSplashScreens() {
  // Ensure target folder exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('🚀 Starting splash screen generation engine...');

  for (const size of sizes) {
    const targetPath = path.join(OUTPUT_DIR, size.name);

    await sharp(MASTER_IMAGE)
      .resize(size.w, size.h, {
        fit: 'cover',
        position: 'center',
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(targetPath);

    console.log(`✅ Generated: ${size.name} (${size.w}x${size.h})`);
  }

  console.log('🎉 All splash screens generated seamlessly!');
}

generateSplashScreens().catch((err) => {
  console.error('❌ Generation failed:', err);
});

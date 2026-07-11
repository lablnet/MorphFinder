import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import sharp from 'sharp';
// @ts-ignore
import png2icons from 'png2icons';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const assetsDir = path.join(projectRoot, 'assets');
const buildDir = path.join(projectRoot, 'build');
const iconsDir = path.join(buildDir, 'icons');

// Source paths
const logoSrc = path.join(assetsDir, 'logo.png');
const coverSrc = path.join(assetsDir, 'cover.png');

async function removeBlackBackground(buffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    
    // Check pixel brightness
    const intensity = Math.max(r, g, b);
    
    // Smooth threshold for transparency
    if (intensity < 15) {
      data[i + 3] = 0;
    } else if (intensity < 65) {
      const ratio = (intensity - 15) / (65 - 15);
      data[i + 3] = Math.round(255 * ratio);
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toBuffer();
}

async function buildAssets() {
  try {
    console.log('Building assets via TypeScript...');

    // Verify source files exist
    if (!fs.existsSync(logoSrc)) {
      throw new Error(`Source logo not found at: ${logoSrc}`);
    }
    if (!fs.existsSync(coverSrc)) {
      throw new Error(`Source cover not found at: ${coverSrc}`);
    }

    // Ensure output directories exist
    fs.mkdirSync(buildDir, { recursive: true });
    fs.mkdirSync(iconsDir, { recursive: true });

    // Load and make logo transparent
    const logoBufferRaw = await fs.promises.readFile(logoSrc);
    const logoBuffer = await removeBlackBackground(logoBufferRaw);

    // 1. Create standard build/icon.png (1024x1024)
    const mainIconPng = await sharp(logoBuffer).resize(1024, 1024).png().toBuffer();
    fs.writeFileSync(path.join(buildDir, 'icon.png'), mainIconPng);
    console.log('Created: build/icon.png (Transparent)');

    // 2. Create build/icon.ico using png2icons (supports high-quality conversion to ICO)
    const icoBuffer = png2icons.createICO(mainIconPng, png2icons.RESCALE_LANCZOS, 0, false);
    if (icoBuffer) {
      fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);
      console.log('Created: build/icon.ico');
    } else {
      console.error('Failed to generate ICO buffer.');
    }

    // 3. Create build/icon.icns using png2icons
    const icnsBuffer = png2icons.createICNS(mainIconPng, png2icons.RESCALE_LANCZOS, 0);
    if (icnsBuffer) {
      fs.writeFileSync(path.join(buildDir, 'icon.icns'), icnsBuffer);
      console.log('Created: build/icon.icns');
    } else {
      console.error('Failed to generate ICNS buffer.');
    }

    // 4. Create standard Electron icons subdirectory for Linux/other sizes
    const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
    for (const size of sizes) {
      const resized = await sharp(logoBuffer).resize(size, size).png().toBuffer();
      fs.writeFileSync(path.join(iconsDir, `${size}x${size}.png`), resized);
      console.log(`Created: build/icons/${size}x${size}.png`);
    }

    // 5. Create notification.png (20x20) and dock_icon.png (512x512) in build/
    const notification = await sharp(logoBuffer).resize(20, 20).png().toBuffer();
    const dockIcon = await sharp(logoBuffer).resize(512, 512).png().toBuffer();
    fs.writeFileSync(path.join(buildDir, 'notification.png'), notification);
    fs.writeFileSync(path.join(buildDir, 'dock_icon.png'), dockIcon);
    console.log('Created: build/notification.png');
    console.log('Created: build/dock_icon.png');

    // 6. Clean up assets/ directory (remove anything that is not logo.png or cover.png)
    const allowedAssets = new Set(['logo.png', 'cover.png']);
    const filesInAssets = fs.readdirSync(assetsDir);
    for (const file of filesInAssets) {
      if (!allowedAssets.has(file)) {
        const filePath = path.join(assetsDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old asset: assets/${file}`);
        }
      }
    }

    // 7. macOS Local Development Patch (force dev binary to display the correct name and icon)
    if (process.platform === 'darwin') {
      const devAppPath = path.join(projectRoot, 'node_modules', 'electron', 'dist', 'Electron.app');
      const devIconPath = path.join(devAppPath, 'Contents', 'Resources', 'electron.icns');
      const devPlistPath = path.join(devAppPath, 'Contents', 'Info.plist');
      const buildIcnsPath = path.join(buildDir, 'icon.icns');

      if (fs.existsSync(devAppPath)) {
        console.log('Detected local macOS development Electron.app. Patching assets...');
        
        // Copy our brand new icns over the default electron.icns
        if (fs.existsSync(buildIcnsPath)) {
          fs.copyFileSync(buildIcnsPath, devIconPath);
          console.log('Patched dev icon inside Electron.app');
        }

        // Patch Info.plist display name
        try {
          execSync(`plutil -replace CFBundleName -string "MorphFinder" "${devPlistPath}"`);
          execSync(`plutil -replace CFBundleDisplayName -string "MorphFinder" "${devPlistPath}"`);
          execSync(`touch "${devAppPath}"`);
          console.log('Patched dev Info.plist & touched Electron.app bundle');
        } catch (plistError) {
          console.warn('Could not patch Electron.app Info.plist:', plistError);
        }
      }
    }

    console.log('Successfully processed all assets and application icons!');
  } catch (error) {
    console.error('Error during asset compilation:', error);
    process.exit(1);
  }
}

buildAssets();

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Mac App Store valid screenshot sizes:
// 2880 x 1800 (Recommended 16:10 Retina)
// 2560 x 1600
// 1440 x 900
// 1280 x 800
const TARGET_WIDTH = 2880;
const TARGET_HEIGHT = 1800;

const SCREENSHOT_DIR = path.join(process.cwd(), 'assets/screnshorts');
const BACKUP_DIR = path.join(SCREENSHOT_DIR, 'original_backup');

async function fixScreenshots() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    console.error(`Directory not found: ${SCREENSHOT_DIR}`);
    process.exit(1);
  }

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SCREENSHOT_DIR).filter((f) => f.endsWith('.png'));

  console.log(`Found ${files.length} screenshots in ${SCREENSHOT_DIR}\n`);

  for (const file of files) {
    const inputPath = path.join(SCREENSHOT_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);

    // Save backup if not already backed up
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
    }

    // Read original metadata
    const image = sharp(backupPath);
    const meta = await image.metadata();

    // Sample top-left corner pixel color for seamless padding background
    const buffer = await sharp(backupPath)
      .extract({ left: 0, top: 0, width: 1, height: 1 })
      .raw()
      .toBuffer();

    const bgColor = {
      r: buffer[0],
      g: buffer[1],
      b: buffer[2],
      alpha: buffer.length > 3 ? buffer[3] / 255 : 1
    };

    // Resize with 'contain' and edge pixel background padding
    await sharp(backupPath)
      .resize({
        width: TARGET_WIDTH,
        height: TARGET_HEIGHT,
        fit: 'contain',
        background: bgColor
      })
      .toFile(inputPath);

    const newMeta = await sharp(inputPath).metadata();
    console.log(
      `✓ Processed ${file}: ${meta.width}x${meta.height} -> ${newMeta.width}x${newMeta.height} (${TARGET_WIDTH}x${TARGET_HEIGHT})`
    );
  }

  console.log(`\nAll screenshots successfully resized to ${TARGET_WIDTH}x${TARGET_HEIGHT}px (16:10 App Store compliant).`);
  console.log(`Originals backed up to: ${BACKUP_DIR}`);
}

fixScreenshots().catch((err) => {
  console.error('Error fixing screenshots:', err);
  process.exit(1);
});
